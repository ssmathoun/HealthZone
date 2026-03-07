import svgPaths from "./svg-jmti70jhif";

function Group() {
  return (
    <div className="absolute contents left-0 top-[945px]">
      <div className="absolute bg-[#1e293b] h-[75px] left-0 top-[945px] w-[1440px]" />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-0 top-[945px]">
      <Group />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium h-[14.362px] leading-[normal] left-[612px] not-italic text-[#fdfbfc] text-[15px] top-[975.32px] w-[218px] whitespace-pre-wrap">© 2026 HealthZone (HZ Labs)</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-['Inter:Semi_Bold',sans-serif] font-normal font-semibold h-[27.926px] leading-[0] left-[8px] not-italic text-[#fdfbfc] text-[0px] text-[20px] top-[971px] w-[115px] whitespace-pre-wrap">
        <span className="leading-[normal] text-[#d97706]">Health</span>
        <span className="leading-[normal]">Zone</span>
      </p>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium h-[14.362px] leading-[normal] left-[1237px] not-italic text-[#fdfbfc] text-[15px] top-[976px] w-[67px] whitespace-pre-wrap">About Us</p>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium h-[14.362px] leading-[normal] left-[1346px] not-italic text-[#fdfbfc] text-[15px] top-[975.32px] w-[81px] whitespace-pre-wrap">Contact Us</p>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[567px] top-[835px]">
      <div className="absolute bg-[#64748b] h-[50px] left-[567px] rounded-[100px] top-[835px] w-[308px]" />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="bg-[#fdfcfb] relative size-full" data-name="Profile Page">
      <div className="-translate-x-1/2 absolute bg-[#1e293b] h-[865px] left-[calc(50%+1px)] top-[38px] w-[580px]" />
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[358.77px] not-italic text-[12px] text-black top-[440.78px]">&nbsp;</p>
      <Group1 />
      <div className="absolute h-[41px] left-[567px] top-[334px] w-[308px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 308 41">
          <path d={svgPaths.p633fd00} fill="var(--fill-0, #D9D9D9)" id="Rectangle 18" />
        </svg>
      </div>
      <div className="absolute h-[41px] left-[566px] top-[427px] w-[308px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 308 41">
          <path d={svgPaths.p633fd00} fill="var(--fill-0, #D9D9D9)" id="Rectangle 18" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[normal] left-[567px] not-italic text-[20px] text-white top-[302px] w-[109px] whitespace-pre-wrap">{`Full Name `}</p>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[normal] left-[567px] not-italic text-[20px] text-white top-[391px] w-[109px] whitespace-pre-wrap">Username</p>
      <div className="absolute h-[41px] left-[567px] top-[601px] w-[308px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 308 41">
          <path d={svgPaths.p633fd00} fill="var(--fill-0, #D9D9D9)" id="Rectangle 18" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[normal] left-[567px] not-italic text-[20px] text-white top-[569px]">Current Password</p>
      <div className="absolute h-[41px] left-[568px] top-[690px] w-[308px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 308 41">
          <path d={svgPaths.p633fd00} fill="var(--fill-0, #D9D9D9)" id="Rectangle 18" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[normal] left-[568px] not-italic text-[20px] text-white top-[660px] w-[191px] whitespace-pre-wrap">New Password</p>
      <div className="absolute h-[41px] left-[568px] top-[512px] w-[308px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 308 41">
          <path d={svgPaths.p633fd00} fill="var(--fill-0, #D9D9D9)" id="Rectangle 18" />
        </svg>
      </div>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium h-[32px] leading-[normal] left-[568px] not-italic text-[20px] text-white top-[480px] w-[109px] whitespace-pre-wrap">Email</p>
      <div className="absolute bg-[#d97706] h-[50px] left-[568px] rounded-[100px] top-[766px] w-[308px]" />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold h-[22px] leading-[normal] left-[calc(50%-64px)] not-italic text-[18px] text-white top-[780px] w-[133px] whitespace-pre-wrap">Save Changes</p>
      <Group2 />
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold h-[22px] leading-[normal] left-[calc(50%-28px)] not-italic text-[18px] text-white top-[847px] w-[61px] whitespace-pre-wrap">Home</p>
    </div>
  );
}