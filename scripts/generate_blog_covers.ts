import fs from 'node:fs';
import path from 'node:path';

type Article = { slug: string; title: string; category: string; motif: string };
const articles: Article[] = [
  {slug:'what-to-pack-red-sea-boat-trip',title:'What to Pack for a Red Sea Boat Trip',category:'Trip Planning',motif:'suitcase'},
  {slug:'beginner-guide-snorkeling-red-sea',title:'A Beginner’s Guide to Snorkeling in the Red Sea',category:'Red Sea Experiences',motif:'mask'},
  {slug:'giftun-islands-orange-bay-island-day',title:'Giftun Islands and Orange Bay: Planning Your Island Day',category:'Red Sea Experiences',motif:'island'},
  {slug:'hurghada-beyond-the-beach-local-experiences',title:'Hurghada Beyond the Beach: Local Experiences to Explore',category:'Travel Guides',motif:'market'},
  {slug:'best-time-to-visit-hurghada-red-sea',title:'When Is the Best Time to Visit Hurghada?',category:'Travel Guides',motif:'sunset'},
  {slug:'hurghada-desert-safari-what-to-expect',title:'What to Expect on a Desert Safari from Hurghada',category:'Red Sea Experiences',motif:'jeep'},
  {slug:'hurghada-travel-guide-first-visit',title:'Hurghada Travel Guide: What First-Time Visitors Should Know',category:'Travel Guides',motif:'compass'},
  {slug:'how-to-choose-boat-trip-hurghada',title:'How to Choose a Boat Trip in Hurghada',category:'Trip Planning',motif:'boat'},
  {slug:'family-friendly-red-sea-excursion-guide',title:'Choosing a Family-Friendly Sea Adventure',category:'Trip Planning',motif:'family'},
  {slug:'responsible-snorkeling-protect-coral-reefs',title:'Responsible Snorkeling: Simple Ways to Protect Coral Reefs',category:'Responsible Travel',motif:'coral'},
  {slug:'giftun-islands-beginners-guide',title:'A Beginner’s Guide to the Giftun Islands',category:'Red Sea Experiences',motif:'island'},
  {slug:'travel-insurance-red-sea-activities-guide',title:'What to Know About Travel Insurance for Red Sea Activities',category:'Trip Planning',motif:'document'},
  {slug:'multi-generational-family-hurghada-holiday',title:'Planning a Multi-Generational Family Holiday in Hurghada',category:'Trip Planning',motif:'family'},
  {slug:'what-to-wear-hurghada-desert-safari',title:'What to Wear and Bring for a Hurghada Desert Safari',category:'Trip Planning',motif:'suitcase'},
  {slug:'hurghada-desert-safari-vs-sea-excursion',title:'Desert Safari or Sea Excursion: Which Hurghada Day Trip Fits You?',category:'Trip Planning',motif:'compass'},
  {slug:'what-to-do-uncomfortable-snorkeling-water',title:'What to Do if You Feel Uncomfortable in the Water',category:'Trip Planning',motif:'lifebuoy'},
  {slug:'snorkeling-with-children-red-sea-guide',title:'Snorkeling With Children: A Parent’s Preparation Checklist',category:'Trip Planning',motif:'family'},
  {slug:'seasickness-preparation-red-sea-boat',title:'How to Prepare for Seasickness on a Boat Day',category:'Trip Planning',motif:'waves'},
  {slug:'what-to-wear-red-sea-boat-excursion',title:'What to Wear for a Red Sea Boat Excursion',category:'Trip Planning',motif:'suitcase'},
  {slug:'questions-to-ask-before-booking-red-sea-excursion',title:'What to Ask Before Booking a Sea Adventure',category:'Trip Planning',motif:'checklist'},
  {slug:'red-sea-holiday-budget-planning',title:'How to Plan a Red Sea Holiday on a Sensible Budget',category:'Trip Planning',motif:'coins'},
  {slug:'hurghada-two-day-weekend-itinerary',title:'A Weekend in Hurghada: A Relaxed Two-Day Plan',category:'Trip Planning',motif:'calendar'},
  {slug:'hurghada-souvenir-shopping-guide',title:'A Guide to Souvenir Shopping in Hurghada',category:'Travel Guides',motif:'market'},
  {slug:'egyptian-food-hurghada-first-time-guide',title:'A First-Time Visitor’s Guide to Egyptian Food in Hurghada',category:'Travel Guides',motif:'food'},
  {slug:'desert-sunset-hurghada-guide',title:'A Guide to Desert Sunsets Near Hurghada',category:'Travel Guides',motif:'sunset'},
  {slug:'hurghada-beaches-resort-coastline-guide',title:'A Guide to Hurghada’s Beaches and Resort Coastline',category:'Travel Guides',motif:'beach'},
  {slug:'hurghada-sunset-evening-experiences',title:'A Guide to Sunset and Evening Experiences in Hurghada',category:'Travel Guides',motif:'sunset'},
  {slug:'getting-around-hurghada-transport-guide',title:'A Practical Guide to Getting Around Hurghada',category:'Travel Guides',motif:'van'},
  {slug:'hurghada-or-el-gouna-where-to-stay',title:'Hurghada or El Gouna: Which Red Sea Base Suits Your Trip?',category:'Travel Guides',motif:'map'},
  {slug:'el-dahar-old-hurghada-visitor-guide',title:'Exploring El Dahar: A Visitor’s Guide to Old Hurghada',category:'Travel Guides',motif:'market'},
  {slug:'hurghada-marina-first-time-guide',title:'A First-Timer’s Guide to the Hurghada Marina',category:'Travel Guides',motif:'boat'},
  {slug:'red-sea-weather-wind-boat-trip-planning',title:'What to Know About Red Sea Weather and Wind',category:'Trip Planning',motif:'wind'},
  {slug:'how-many-days-in-hurghada-itinerary',title:'How Many Days Should You Spend in Hurghada?',category:'Trip Planning',motif:'calendar'},
  {slug:'choose-responsible-desert-tour-operator',title:'How to Choose a Responsible Desert Tour Operator',category:'Responsible Travel',motif:'jeep'},
  {slug:'visiting-bedouin-community-respectfully',title:'A Respectful Guide to Visiting a Bedouin Community',category:'Responsible Travel',motif:'tent'},
  {slug:'why-not-touch-feed-red-sea-fish',title:'Why You Should Never Touch or Feed Reef Fish',category:'Responsible Travel',motif:'fish'},
  {slug:'underwater-photography-reef-friendly-tips',title:'How to Take Underwater Photos Without Harming the Reef',category:'Responsible Travel',motif:'camera'},
  {slug:'red-sea-boat-etiquette-guide',title:'A Guide to Boat Etiquette on the Red Sea',category:'Responsible Travel',motif:'boat'},
  {slug:'dolphin-watching-hurghada-responsible-guide',title:'Dolphin Watching in Hurghada: Responsible Visitor Guide',category:'Responsible Travel',motif:'dolphin'},
  {slug:'red-sea-coral-reefs-visitor-guide',title:'Red Sea Coral Reefs: What Visitors Should Notice',category:'Responsible Travel',motif:'coral'},
  {slug:'egypt-red-sea-marine-protected-areas-guide',title:'A Guide to Marine Protected Areas in Egypt’s Red Sea',category:'Responsible Travel',motif:'reef'},
  {slug:'hurghada-jeep-safari-guide',title:'Jeep Safari in Hurghada: What to Expect',category:'Red Sea Experiences',motif:'jeep'},
  {slug:'hurghada-quad-biking-safety-guide',title:'A Visitor’s Guide to Quad Biking in the Hurghada Desert',category:'Red Sea Experiences',motif:'quad'},
  {slug:'snorkeling-vs-scuba-diving-red-sea',title:'Snorkeling vs Scuba Diving: Which Red Sea Experience Is Right?',category:'Red Sea Experiences',motif:'diver'},
  {slug:'beginner-scuba-diving-hurghada-guide',title:'A Beginner’s Guide to Scuba Diving in Hurghada',category:'Red Sea Experiences',motif:'diver'},
  {slug:'hurghada-glass-bottom-boat-guide',title:'Is a Glass-Bottom Boat Right for You?',category:'Red Sea Experiences',motif:'glassboat'},
  {slug:'red-sea-fish-to-look-for-snorkeling',title:'Common Red Sea Fish You May See While Snorkeling',category:'Red Sea Experiences',motif:'fish'},
  {slug:'choose-snorkeling-spot-by-experience-level',title:'How to Choose a Snorkeling Spot for Your Ability',category:'Red Sea Experiences',motif:'mask'},
  {slug:'typical-hurghada-snorkeling-boat-day',title:'What Happens on a Typical Snorkeling Boat Day?',category:'Red Sea Experiences',motif:'boat'},
  {slug:'orange-bay-vs-paradise-island-trip-comparison',title:'Orange Bay or Paradise Island: How to Compare the Trips',category:'Red Sea Experiences',motif:'island'},
];

const palettes: Record<string, [string,string,string]> = {
  'Trip Planning':['#0C3445','#1D7180','#F0C77A'],
  'Red Sea Experiences':['#073B4C','#0E8A91','#F4D58D'],
  'Travel Guides':['#17324D','#B77A45','#F2D6A2'],
  'Responsible Travel':['#123F3B','#2A8878','#D7C98E'],
};
const xml = (s:string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const hash = (s:string) => [...s].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,11);
function linesFor(title:string):string[] {
  const result:string[]=[]; let line='';
  for (const word of title.split(/\s+/)) {
    if ((line+' '+word).trim().length>25 && line) { result.push(line); line=word; }
    else line=(line+' '+word).trim();
  }
  if(line) result.push(line);
  return result.slice(0,3);
}
function art(m:string):string {
  if(m==='boat'||m==='glassboat') return '<path d="M-170 55H165L112 120H-105Z" fill="#F5E7C6" stroke="#fff" stroke-width="5"/><path d="M-60 50V-48H35V50M-52 -44V-112L20 -44" fill="none" stroke="#fff" stroke-width="9"/><path d="M-230 142Q-160 115 -90 142T50 142T190 142" fill="none" stroke="#BCE9E4" stroke-width="10"/>';
  if(m==='mask'||m==='diver') return '<rect x="-145" y="-82" width="112" height="82" rx="25" fill="none" stroke="#F6E8C9" stroke-width="13"/><rect x="33" y="-82" width="112" height="82" rx="25" fill="none" stroke="#F6E8C9" stroke-width="13"/><path d="M-33 -42H33M-145 -45L-205 -85M145 -45L205 -85M-54 8Q0 75 54 8" fill="none" stroke="#F6E8C9" stroke-width="12" stroke-linecap="round"/><circle cx="0" cy="-150" r="15" fill="#F3C66E"/><circle cx="55" cy="-195" r="9" fill="#F3C66E"/>';
  if(m==='island'||m==='beach') return '<path d="M-210 115Q-100 -5 25 80Q115 20 220 120Z" fill="#E9C47A"/><path d="M-90 55Q-80 -80 -10 -155Q-20 -35 -90 55M-20 -145Q45 -175 78 -125Q15 -132 -20 -145" fill="#2E9C7C"/><path d="M-235 160Q-130 125 -25 160T185 160" stroke="#BDEAE3" stroke-width="11" fill="none"/>';
  if(m==='jeep'||m==='quad'||m==='van') return '<path d="M-190 20L-125 -65H75L145 20Z" fill="#F1D49A" stroke="#fff" stroke-width="7"/><rect x="-190" y="20" width="360" height="82" rx="22" fill="#E5A94E" stroke="#fff" stroke-width="7"/><circle cx="-105" cy="110" r="38" fill="#18333A" stroke="#F6E8C9" stroke-width="10"/><circle cx="95" cy="110" r="38" fill="#18333A" stroke="#F6E8C9" stroke-width="10"/>';
  if(m==='compass'||m==='map') return '<circle cx="0" cy="0" r="155" fill="none" stroke="#F6E8C9" stroke-width="10"/><circle cx="0" cy="0" r="115" fill="none" stroke="#F6E8C9" stroke-width="4"/><path d="M0 -128L34 10L0 55L-34 10Z" fill="#F3C66E"/><path d="M0 128L-34 -10L0 -55L34 -10Z" fill="#fff" opacity=".8"/><text x="0" y="-178" text-anchor="middle" fill="#fff" font-size="22" font-weight="700">N</text>';
  if(m==='family') return '<circle cx="-80" cy="-75" r="38" fill="#F1D49A"/><circle cx="20" cy="-105" r="46" fill="#F1D49A"/><circle cx="115" cy="-72" r="34" fill="#F1D49A"/><path d="M-140 90Q-140 -10 -80 -10Q-20 -10 -20 90M-55 95Q-55 -30 20 -30Q95 -30 95 95M75 90Q75 0 115 0Q155 0 155 90" fill="#E8B45C" stroke="#fff" stroke-width="7"/>';
  if(m==='coral'||m==='reef') return '<path d="M-150 150V-15L-215 -20M-150 75L-85 0M-50 150V-85L-110 -65M-50 35L20 -40M65 150V-25L15 -40M65 50L135 -10M160 150V10" stroke="#F1C47B" stroke-width="18" stroke-linecap="round" fill="none"/><path d="M-230 170Q-100 130 0 170T230 170" fill="none" stroke="#BCE9E4" stroke-width="10"/>';
  if(m==='fish'||m==='dolphin') return '<path d="M-175 0Q-80 -95 55 -20Q110 0 150 0Q110 20 55 20Q-80 95 -175 0Z" fill="#F1D49A"/><path d="M-175 0L-240 -58L-230 0L-240 58Z" fill="#E7A84F"/><circle cx="85" cy="-7" r="8" fill="#123B45"/><path d="M-35 -25Q-5 -95 50 -80Q20 -45 -35 -25" fill="#E7A84F"/><circle cx="-115" cy="110" r="12" fill="#BCE9E4"/><circle cx="-70" cy="150" r="8" fill="#BCE9E4"/>';
  if(m==='camera') return '<rect x="-170" y="-85" width="340" height="230" rx="30" fill="#F1D49A" stroke="#fff" stroke-width="8"/><path d="M-85 -85L-45 -125H55L90 -85" fill="#F1D49A" stroke="#fff" stroke-width="8"/><circle cx="0" cy="25" r="86" fill="#0C3445" stroke="#fff" stroke-width="10"/><circle cx="0" cy="25" r="52" fill="#2A9A9C"/>';
  if(m==='sunset') return '<circle cx="25" cy="-65" r="100" fill="#F5C66F"/><path d="M-245 125Q-110 -10 25 95Q135 5 250 125Z" fill="#C47D4D"/><path d="M-245 155Q-95 55 25 150Q135 60 250 155Z" fill="#8C624E"/>';
  if(m==='market') return '<path d="M-180 130V-20H180V130Z" fill="#F1D49A" stroke="#fff" stroke-width="7"/><path d="M-195 -20Q-150 -120 -95 -20Q-50 -120 0 -20Q50 -120 95 -20Q150 -120 195 -20" fill="#D28A4D" stroke="#fff" stroke-width="7"/><rect x="-55" y="30" width="110" height="100" fill="#0C3445"/>';
  if(m==='food') return '<circle cx="0" cy="0" r="145" fill="#F5E7C6" stroke="#fff" stroke-width="12"/><circle cx="0" cy="0" r="100" fill="#D18B4F"/><circle cx="-28" cy="-18" r="26" fill="#F3D48C"/><circle cx="38" cy="20" r="22" fill="#5C9A66"/><path d="M-180 -120V120M-205 -120V-35M-155 -120V-35M165 -120V120" stroke="#F5E7C6" stroke-width="10"/>';
  if(m==='document'||m==='checklist') return '<rect x="-125" y="-170" width="250" height="340" rx="20" fill="#F5E7C6" stroke="#fff" stroke-width="8"/><path d="M-75 -85L-40 -50L5 -105M25 -85H85M-75 0L-40 35L5 -20M25 0H85M-75 85L-40 120L5 65M25 85H85" stroke="#287D76" stroke-width="13" fill="none" stroke-linecap="round"/>';
  if(m==='calendar') return '<rect x="-170" y="-135" width="340" height="270" rx="24" fill="#F5E7C6" stroke="#fff" stroke-width="8"/><path d="M-170 -60H170M-95 -175V-100M95 -175V-100" stroke="#fff" stroke-width="14" stroke-linecap="round"/><path d="M-100 0H-35M25 0H100M-100 75H-35M25 75H100" stroke="#D18B4F" stroke-width="18" stroke-linecap="round"/>';
  if(m==='coins') return '<ellipse cx="-60" cy="80" rx="110" ry="36" fill="#E4B25E" stroke="#fff" stroke-width="7"/><path d="M-170 45V-5Q-60 -75 50 -5V45Q-60 115 -170 45Z" fill="#E4B25E" stroke="#fff" stroke-width="7"/><ellipse cx="65" cy="-30" rx="110" ry="36" fill="#F5D78D" stroke="#fff" stroke-width="7"/>';
  if(m==='lifebuoy') return '<circle cx="0" cy="0" r="145" fill="#F5E7C6" stroke="#fff" stroke-width="10"/><circle cx="0" cy="0" r="75" fill="#0C3445"/><path d="M-110 -110L-65 -65M110 -110L65 -65M-110 110L-65 65M110 110L65 65" stroke="#E7A84F" stroke-width="42" stroke-linecap="round"/>';
  if(m==='waves'||m==='wind') return '<path d="M-230 -65Q-150 -130 -70 -65T90 -65T230 -65M-230 0Q-150 -65 -70 0T90 0T230 0M-230 65Q-150 0 -70 65T90 65T230 65" stroke="#F5E7C6" stroke-width="15" fill="none" stroke-linecap="round"/><circle cx="155" cy="-145" r="35" fill="#F3C66E"/>';
  if(m==='tent') return '<path d="M-190 140L0 -155L190 140Z" fill="#D18B4F" stroke="#F5E7C6" stroke-width="8"/><path d="M-45 140L0 20L45 140" fill="#0C3445"/>';
  if(m==='suitcase') return '<rect x="-150" y="-95" width="300" height="245" rx="28" fill="#E7B45D" stroke="#fff" stroke-width="9"/><path d="M-65 -95V-145H65V-95M-65 -25H65M-65 45H65" stroke="#F5E7C6" stroke-width="12" fill="none"/><circle cx="-90" cy="155" r="20" fill="#0C3445"/><circle cx="90" cy="155" r="20" fill="#0C3445"/>';
  return '<circle cx="0" cy="0" r="145" fill="none" stroke="#F5E7C6" stroke-width="12"/><path d="M-95 45Q0 -120 95 45Q0 140 -95 45Z" fill="#E8B45C"/>';
}
function render(a:Article,i:number):string {
  const palette=palettes[a.category]||palettes['Travel Guides'];
  const h=hash(a.slug);
  const lines=linesFor(a.title);
  const titleMarkup=lines.map((line,n)=>'<tspan x="76" dy="'+(n===0?0:60)+'">'+xml(line)+'</tspan>').join('');
  const y=300-Math.max(0,lines.length-1)*29;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="cover-title cover-desc">',
    '<title id="cover-title">'+xml(a.title)+'</title>',
    '<desc id="cover-desc">Original KemetSpirit editorial illustration for '+xml(a.title)+'.</desc>',
    '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+palette[0]+'"/><stop offset="1" stop-color="'+palette[1]+'"/></linearGradient><radialGradient id="glow"><stop offset="0" stop-color="'+palette[2]+'" stop-opacity=".58"/><stop offset="1" stop-color="'+palette[2]+'" stop-opacity="0"/></radialGradient><pattern id="grain" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.5" fill="#fff" opacity=".16"/></pattern></defs>',
    '<rect width="1200" height="675" fill="url(#bg)"/><rect width="1200" height="675" fill="url(#grain)"/>',
    '<circle cx="'+(880+h%90)+'" cy="'+(220+h%70)+'" r="330" fill="url(#glow)"/>',
    '<path d="M650 560Q820 430 980 535T1320 520V720H620Z" fill="#061F2C" opacity=".23"/><path d="M620 620Q790 510 930 600T1240 590" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="4"/>',
    '<g transform="translate('+(885+i%4*10)+' '+(340+i%3*8)+') rotate('+(h%11-5)+')"><circle r="245" fill="#fff" opacity=".07"/><circle r="210" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3" stroke-dasharray="10 16"/>'+art(a.motif)+'</g>',
    '<path d="M76 104H145" stroke="'+palette[2]+'" stroke-width="7" stroke-linecap="round"/><text x="76" y="82" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="19" font-weight="700" letter-spacing="5">KEMETSPIRIT JOURNAL</text>',
    '<text x="76" y="166" fill="'+palette[2]+'" font-family="Arial,Helvetica,sans-serif" font-size="18" font-weight="700" letter-spacing="3">'+xml(a.category.toUpperCase())+'</text>',
    '<text x="76" y="'+y+'" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="'+(lines.length>2?42:48)+'" font-weight="700" letter-spacing="-1">'+titleMarkup+'</text>',
    '<text x="76" y="600" fill="#fff" fill-opacity=".78" font-family="Arial,Helvetica,sans-serif" font-size="16" letter-spacing="3">EGYPT • RED SEA • LOCAL KNOWLEDGE</text>',
    '<circle cx="1120" cy="82" r="26" fill="'+palette[2]+'"/><path d="M1108 82L1117 91L1134 71" fill="none" stroke="'+palette[0]+'" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
    '</svg>'
  ].join('\n');
}
const output=path.resolve('public/blog-covers');
fs.mkdirSync(output,{recursive:true});
for(const [i,a] of articles.entries()) fs.writeFileSync(path.join(output,a.slug+'.svg'),render(a,i),'utf8');
console.log('Generated '+articles.length+' original KemetSpirit blog cover illustrations.');
