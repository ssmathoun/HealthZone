<?php
require "autoload.php";
require_once "challenges_support.php";

function ensure_challenges_tables(PDO $connection): void
{
    $connection->exec("
        CREATE TABLE IF NOT EXISTS challenges (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            description TEXT NOT NULL,
            icon_name VARCHAR(40) NOT NULL DEFAULT 'trophy',
            metric_key VARCHAR(40) NOT NULL DEFAULT 'workouts_completed',
            target_value INT NOT NULL DEFAULT 1,
            unit_label VARCHAR(40) NOT NULL DEFAULT 'workouts',
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // Add points_reward column if it doesn't exist yet
    try {
        $cols = $connection->query("SHOW COLUMNS FROM challenges LIKE 'points_reward'")->fetchAll();
        if (empty($cols)) {
            $connection->exec("ALTER TABLE challenges ADD COLUMN points_reward INT NOT NULL DEFAULT 100");
            $connection->exec("UPDATE challenges SET points_reward = 500 WHERE id = 1");
            $connection->exec("UPDATE challenges SET points_reward = 150 WHERE id = 2");
            $connection->exec("UPDATE challenges SET points_reward = 250 WHERE id = 3");
        }
    } catch (PDOException) {
        // Column already exists (concurrent request) — safe to ignore
    }

    $connection->exec("
        CREATE TABLE IF NOT EXISTS user_challenges (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            challenge_id INT NOT NULL,
            progress INT NOT NULL DEFAULT 0,
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_challenge (user_id, challenge_id),
            KEY idx_user_challenges_user (user_id),
            KEY idx_user_challenges_challenge (challenge_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $connection->exec("
        CREATE TABLE IF NOT EXISTS user_points (
            user_id INT PRIMARY KEY,
            total_points INT NOT NULL DEFAULT 0,
            is_ranked TINYINT(1) NOT NULL DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    // Add is_ranked column to existing user_points tables
    try {
        $cols = $connection->query("SHOW COLUMNS FROM user_points LIKE 'is_ranked'")->fetchAll();
        if (empty($cols)) {
            $connection->exec("ALTER TABLE user_points ADD COLUMN is_ranked TINYINT(1) NOT NULL DEFAULT 0");
        }
    } catch (PDOException) {
        // Column already exists — safe to ignore
    }

    $challengeCount = (int) $connection->query("SELECT COUNT(*) FROM challenges")->fetchColumn();

    if ($challengeCount > 0) {
        return;
    }

    $seed = $connection->prepare("
        INSERT INTO challenges (id, name, description, icon_name, metric_key, target_value, unit_label, points_reward, is_active)
        VALUES
            (1, :name_one,   :description_one,   'flame',    'workouts_completed', 30, 'workouts', 500, 1),
            (2, :name_two,   :description_two,   'activity', 'workouts_completed', 10, 'workouts', 150, 1),
            (3, :name_three, :description_three, 'dumbbell', 'workouts_completed', 20, 'workouts', 250, 1)
    ");

    $seed->execute([
        'name_one'         => '30-Day Consistency',
        'description_one'  => 'Log 30 workouts and build a steady fitness routine.',
        'name_two'         => '10 Workout Kickstart',
        'description_two'  => 'Complete your first 10 workouts to get momentum going.',
        'name_three'       => 'Strength Builder',
        'description_three'=> 'Finish 20 strength-focused sessions and level up your training.',
    ]);
}

function calculate_my_points(PDO $connection, int $userId): int
{
    $stmt = $connection->prepare("
        SELECT COALESCE(SUM(c.points_reward), 0) AS total
        FROM user_challenges uc
        JOIN challenges c ON c.id = uc.challenge_id
        WHERE uc.user_id = :uid AND uc.status = 'completed'
    ");
    $stmt->execute(['uid' => $userId]);
    return (int) $stmt->fetch()->total;
}

function join_leaderboard(PDO $connection, int $userId): array
{
    ensure_challenges_tables($connection);
    $stmt = $connection->prepare("
        INSERT INTO user_points (user_id, total_points, is_ranked)
        VALUES (:uid, 0, 1)
        ON DUPLICATE KEY UPDATE is_ranked = 1
    ");
    $stmt->execute(['uid' => $userId]);
    $points = calculate_my_points($connection, $userId);
    return ['status' => 'success', 'points' => $points];
}

function leave_leaderboard(PDO $connection, int $userId): array
{
    ensure_challenges_tables($connection);
    $stmt = $connection->prepare("
        UPDATE user_points SET is_ranked = 0 WHERE user_id = :uid
    ");
    $stmt->execute(['uid' => $userId]);
    $points = calculate_my_points($connection, $userId);
    return ['status' => 'success', 'points' => $points];
}

function build_challenge_payload(object $row): array
{
    $progress = isset($row->progress) ? (int) $row->progress : 0;
    $targetValue = isset($row->target_value) ? (int) $row->target_value : 0;
    $participantCount = isset($row->participant_count) ? (int) $row->participant_count : 0;
    $status = $row->status ?? 'available';
    $progressPercent = $targetValue > 0 ? min(100, (int) round(($progress / $targetValue) * 100)) : 0;
    $unitLabel = $row->unit_label ?? 'workouts';

    return [
        'challenge_id'    => (int) $row->id,
        'name'            => $row->name,
        'description'     => $row->description,
        'icon_name'       => $row->icon_name ?? 'trophy',
        'metric_key'      => $row->metric_key ?? 'workouts_completed',
        'target_value'    => $targetValue,
        'unit_label'      => $unitLabel,
        'points_reward'   => isset($row->points_reward) ? (int) $row->points_reward : 100,
        'progress'        => $progress,
        'progress_percent'=> $progressPercent,
        'progress_text'   => $targetValue > 0 ? "{$progress}/{$targetValue} {$unitLabel}" : "{$progress} {$unitLabel}",
        'participant_count'=> $participantCount,
        'status'          => $status,
        'is_joined'       => !empty($row->is_joined) || $status !== 'available',
    ];
}

function get_available_challenges(PDO $connection, ?int $userId): array
{
    ensure_challenges_tables($connection);

    $query = "
        SELECT
            c.*,
            (
                SELECT COUNT(*)
                FROM user_challenges uc_count
                WHERE uc_count.challenge_id = c.id
            ) AS participant_count,
            COALESCE(uc_user.progress, 0) AS progress,
            COALESCE(uc_user.status, 'available') AS status,
            CASE WHEN uc_user.id IS NOT NULL THEN 1 ELSE 0 END AS is_joined
        FROM challenges c
        LEFT JOIN user_challenges uc_user
            ON uc_user.challenge_id = c.id AND uc_user.user_id = :user_id
        WHERE c.is_active = 1
        ORDER BY c.id ASC
    ";

    $statement = $connection->prepare($query);
    $statement->execute(['user_id' => $userId ?? 0]);

    return array_map('build_challenge_payload', $statement->fetchAll());
}

function get_user_challenges(PDO $connection, int $userId): array
{
    ensure_challenges_tables($connection);

    $query = "
        SELECT
            c.*,
            uc.progress,
            uc.status,
            uc.joined_at,
            (
                SELECT COUNT(*)
                FROM user_challenges uc_count
                WHERE uc_count.challenge_id = c.id
            ) AS participant_count,
            1 AS is_joined
        FROM user_challenges uc
        JOIN challenges c ON c.id = uc.challenge_id
        WHERE uc.user_id = :user_id
        ORDER BY (uc.status = 'completed') ASC, uc.joined_at ASC
    ";

    $statement = $connection->prepare($query);
    $statement->execute(['user_id' => $userId]);

    return array_map('build_challenge_payload', $statement->fetchAll());
}

function join_challenge(PDO $connection, int $userId, int $challengeId): array
{
    ensure_challenges_tables($connection);

    $challengeStatement = $connection->prepare("
        SELECT id
        FROM challenges
        WHERE id = :challenge_id
          AND is_active = 1
        LIMIT 1
    ");
    $challengeStatement->execute(['challenge_id' => $challengeId]);

    if (!$challengeStatement->fetch()) {
        return [
            'status'  => 'error',
            'message' => 'Challenge not found.',
        ];
    }

    $existingStatement = $connection->prepare("
        SELECT id
        FROM user_challenges
        WHERE user_id = :user_id
          AND challenge_id = :challenge_id
        LIMIT 1
    ");
    $existingStatement->execute([
        'user_id'      => $userId,
        'challenge_id' => $challengeId,
    ]);

    if ($existingStatement->fetch()) {
        return [
            'status'  => 'success',
            'message' => 'Already joined challenge',
        ];
    }

    $insertStatement = $connection->prepare("
        INSERT INTO user_challenges (user_id, challenge_id, progress, status)
        VALUES (:user_id, :challenge_id, 0, 'active')
    ");
    $insertStatement->execute([
        'user_id'      => $userId,
        'challenge_id' => $challengeId,
    ]);

    return [
        'status'  => 'success',
        'message' => 'Successfully joined challenge',
    ];
}

function increment_workout_challenge_progress(PDO $connection, int $userId, int $amount = 1): void
{
    if ($amount <= 0) {
        return;
    }

    $statement = $connection->prepare("
        UPDATE user_challenges uc
        JOIN challenges c ON c.id = uc.challenge_id
        SET
            uc.progress = LEAST(c.target_value, uc.progress + :progress_increment),
            uc.status = CASE
                WHEN LEAST(c.target_value, uc.progress + :status_increment) >= c.target_value THEN 'completed'
                ELSE 'active'
            END
        WHERE uc.user_id = :user_id
          AND uc.status <> 'completed'
          AND c.is_active = 1
          AND c.metric_key = 'workouts_completed'
    ");

    $statement->execute([
        'progress_increment' => $amount,
        'status_increment'   => $amount,
        'user_id'            => $userId,
    ]);
}

function get_leaderboard(PDO $connection, ?int $userId): array
{
    ensure_challenges_tables($connection);

    $myPoints   = 0;
    $myRank     = null;
    $myIsRanked = false;
    $myUsername = 'You';

    $myLastCompleted = '9999-12-31 23:59:59';

    if ($userId) {
        $myPoints = calculate_my_points($connection, $userId);

        $isRankedStmt = $connection->prepare("SELECT 1 FROM user_points WHERE user_id = :uid AND is_ranked = 1");
        $isRankedStmt->execute(['uid' => $userId]);
        $myIsRanked = (bool) $isRankedStmt->fetch();

        $userStmt = $connection->prepare("SELECT username FROM users WHERE id = :uid");
        $userStmt->execute(['uid' => $userId]);
        $userRow    = $userStmt->fetch();
        $myUsername = $userRow ? $userRow->username : 'You';

        // Tiebreaker: earliest last-completed timestamp wins
        $lcStmt = $connection->prepare("
            SELECT COALESCE(MAX(updated_at), '9999-12-31 23:59:59') AS last_completed
            FROM user_challenges
            WHERE user_id = :uid AND status = 'completed'
        ");
        $lcStmt->execute(['uid' => $userId]);
        $lcRow = $lcStmt->fetch();
        if ($lcRow) $myLastCompleted = $lcRow->last_completed;
    }

    // Top 10: points DESC, then earliest last-completed ASC as tiebreaker
    $top10 = $connection->query("
        SELECT u.id, u.username,
            COALESCE(SUM(c.points_reward), 0) AS earned_points,
            COALESCE(MAX(uc.updated_at), '9999-12-31 23:59:59') AS last_completed
        FROM user_points p
        JOIN users u ON u.id = p.user_id
        LEFT JOIN user_challenges uc ON uc.user_id = p.user_id AND uc.status = 'completed'
        LEFT JOIN challenges c ON c.id = uc.challenge_id
        WHERE p.is_ranked = 1
        GROUP BY u.id, u.username
        HAVING earned_points > 0
        ORDER BY earned_points DESC, last_completed ASC
        LIMIT 10
    ")->fetchAll();

    $leaderboard = array_map(fn($row) => [
        'id'           => (int) $row->id,
        'username'     => $row->username,
        'total_points' => (int) $row->earned_points,
    ], $top10);

    if ($userId && $myIsRanked) {
        // Count users strictly ahead: more points, OR equal points but finished earlier
        $rankStmt = $connection->prepare("
            SELECT COUNT(*) + 1 AS user_rank
            FROM (
                SELECT p.user_id,
                    COALESCE(SUM(c.points_reward), 0) AS pts,
                    COALESCE(MAX(uc.updated_at), '9999-12-31 23:59:59') AS last_completed
                FROM user_points p
                LEFT JOIN user_challenges uc ON uc.user_id = p.user_id AND uc.status = 'completed'
                LEFT JOIN challenges c ON c.id = uc.challenge_id
                WHERE p.is_ranked = 1
                GROUP BY p.user_id
            ) ranked
            WHERE ranked.pts > :pts
               OR (ranked.pts = :pts2 AND ranked.last_completed < :last_completed)
        ");
        $rankStmt->execute([
            'pts'            => $myPoints,
            'pts2'           => $myPoints,
            'last_completed' => $myLastCompleted,
        ]);
        $rankRow = $rankStmt->fetch();
        $myRank  = $rankRow ? (int) $rankRow->user_rank : null;
    }

    return [
        'status'       => 'success',
        'leaderboard'  => $leaderboard,
        'my_rank'      => $myRank,
        'my_points'    => $myPoints,
        'my_is_ranked' => $myIsRanked,
        'my_username'  => $myUsername,
    ];
}