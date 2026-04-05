<?php
require __DIR__ . "/autoload.php";

$origin = $_SERVER['HTTP_ORIGIN'] ?? 'https://aptitude.cse.buffalo.edu';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';
$user_id = $_SESSION['user_id'] ?? 0;

function normalize_recipe_ingredients($raw_ingredients)
{
    if (!$raw_ingredients) {
        return [];
    }

    $decoded = json_decode($raw_ingredients, true);
    if (!is_array($decoded)) {
        return [];
    }

    return array_values(array_filter(array_map(
        static fn($ingredient) => trim((string) $ingredient),
        $decoded
    )));
}

if (!$user_id) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Not logged in"]);
    exit;
}

try {
    if ($action === 'create_recipe' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];

        $stm = $connection->prepare("
            INSERT INTO recipes (
                user_id, name, category, calories, protein, carbs, fat,
                prep_time, servings, ingredients, instructions, image, created_at
            ) VALUES (
                :uid, :name, :cat, :cal, :pro, :carb, :fat,
                :prep, :serv, :ing, :inst, :img, NOW()
            )
        ");
        $stm->execute([
            'uid' => $user_id,
            'name' => trim((string) ($data['name'] ?? '')),
            'cat' => $data['category'] ?? 'Lunch',
            'cal' => (int) ($data['calories'] ?? 0),
            'pro' => (int) ($data['protein'] ?? 0),
            'carb' => (int) ($data['carbs'] ?? 0),
            'fat' => (int) ($data['fat'] ?? 0),
            'prep' => trim((string) ($data['prepTime'] ?? '15 min')),
            'serv' => (int) ($data['servings'] ?? 4),
            'ing' => json_encode($data['ingredients'] ?? []),
            'inst' => trim((string) ($data['instructions'] ?? '')),
            'img' => trim((string) ($data['image'] ?? '')),
        ]);

        echo json_encode(["status" => "success", "id" => (int) $connection->lastInsertId()]);
        exit;
    }

    if ($action === 'share_recipe' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        $recipe_id = (int) ($data['recipe_id'] ?? 0);

        if (!$recipe_id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Recipe ID required"]);
            exit;
        }

        $recipe_stm = $connection->prepare("
            SELECT id, name, category, calories, protein, carbs, fat, prep_time, ingredients, instructions, image
            FROM recipes
            WHERE id = :id AND user_id = :uid
            LIMIT 1
        ");
        $recipe_stm->execute([
            'id' => $recipe_id,
            'uid' => $user_id,
        ]);
        $recipe = $recipe_stm->fetch();

        if (!$recipe) {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "Recipe not found. You can only share your own saved recipes."
            ]);
            exit;
        }

        $ingredients = normalize_recipe_ingredients($recipe->ingredients ?? '');
        $ingredient_preview = array_slice($ingredients, 0, 4);
        $calories = (int) ($recipe->calories ?? 0);
        $protein = (int) ($recipe->protein ?? 0);
        $prep_time = trim((string) ($recipe->prep_time ?? ''));
        $instruction_preview = trim((string) ($recipe->instructions ?? ''));
        if ($instruction_preview !== '' && strlen($instruction_preview) > 140) {
            $instruction_preview = substr($instruction_preview, 0, 137) . '...';
        }

        $body_parts = [
            "Calories: {$calories} cal",
        ];

        if ($protein > 0) {
            $body_parts[] = "Protein: {$protein}g";
        }

        if ($prep_time !== '') {
            $body_parts[] = "Prep time: {$prep_time}";
        }

        if (!empty($ingredient_preview)) {
            $body_parts[] = "Ingredients: " . implode(", ", $ingredient_preview) . (count($ingredients) > 4 ? ", ..." : "");
        }

        if ($instruction_preview !== '') {
            $body_parts[] = "Preview: {$instruction_preview}";
        }

        $media_url = trim((string) ($recipe->image ?? ''));
        $media_type = $media_url !== '' ? 'image' : null;

        $share_stm = $connection->prepare("
            INSERT INTO posts (user_id, title, body, media_url, media_type, created_at)
            VALUES (:user_id, :title, :body, :media_url, :media_type, NOW())
        ");
        $share_stm->execute([
            'user_id' => $user_id,
            'title' => trim((string) ($recipe->name ?? 'Shared Recipe')),
            'body' => implode("\n", $body_parts),
            'media_url' => $media_url !== '' ? $media_url : null,
            'media_type' => $media_type,
        ]);

        echo json_encode([
            "status" => "success",
            "post_id" => (int) $connection->lastInsertId(),
            "message" => "Recipe shared to the community feed"
        ]);
        exit;
    }

    if ($action === 'get_recipes') {
        $stm = $connection->prepare("SELECT * FROM recipes WHERE user_id = :uid ORDER BY created_at DESC");
        $stm->execute(['uid' => $user_id]);
        $recipes = $stm->fetchAll();

        foreach ($recipes as &$recipe) {
            $recipe->ingredients = normalize_recipe_ingredients($recipe->ingredients ?? '');
            $recipe->prepTime = $recipe->prep_time ?? '15 min';
        }
        unset($recipe);

        echo json_encode($recipes);
        exit;
    }

    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid action"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}
