import type { Point } from "@/lib/geo";

export type Category = "City" | "Raid" | "Dungeon" | "Landmark";

export type Question = {
  id: string;
  category: Category;
  /** The clue shown to the player. */
  clue: string;
  /** Name of the true location, shown after the guess. */
  name: string;
  /** Where it is, as normalised map coordinates (0–1). Tweak these to calibrate to your map image. */
  answer: Point;
  /** Lore fact revealed after guessing. */
  fact: string;
};

/**
 * Coordinates are normalised positions (0-1) on public/maps/azeroth.png (1002 x 668),
 * measured by eye against the artwork. Kalimdor is on the left, Eastern Kingdoms on the right.
 * Open the game with ?debug=1 and click the map to read exact coordinates if you want to nudge one.
 */
export const QUESTIONS: Question[] = [
  {
    id: "orgrimmar",
    category: "City",
    clue: "Find the orcish capital of the Horde, founded by Thrall and named for Orgrim Doomhammer.",
    name: "Orgrimmar",
    answer: { x: 0.2964, y: 0.4072 },
    fact: "Orgrimmar sits in northern Durotar. Thrall founded it after leading the orcs to Kalimdor and named it in honour of his predecessor.",
  },
  {
    id: "thunder-bluff",
    category: "City",
    clue: "Find the tauren capital, built on towering mesas and led by Cairne Bloodhoof.",
    name: "Thunder Bluff",
    answer: { x: 0.1916, y: 0.5958 },
    fact: "Thunder Bluff rises above the grasslands of Mulgore, reached by rope bridges and lifts.",
  },
  {
    id: "darnassus",
    category: "City",
    clue: "Find the night elf capital, nestled in the branches of the World Tree Teldrassil.",
    name: "Darnassus",
    answer: { x: 0.1597, y: 0.1677 },
    fact: "Darnassus is found in Teldrassil, off the northwest coast of Kalimdor. Tyrande Whisperwind guides the night elves.",
  },
  {
    id: "stormwind",
    category: "City",
    clue: "Find the human capital of the Alliance, rebuilt after being razed in the First War.",
    name: "Stormwind City",
    answer: { x: 0.7166, y: 0.6856 },
    fact: "Stormwind City lies at the edge of Elwynn Forest and is the heart of the Alliance in the Eastern Kingdoms.",
  },
  {
    id: "ironforge",
    category: "City",
    clue: "Find the dwarven capital carved into a mountain, home of King Magni Bronzebeard.",
    name: "Ironforge",
    answer: { x: 0.7465, y: 0.5090 },
    fact: "Ironforge is hewn into the mountains of Dun Morogh, with the Great Forge at its core.",
  },
  {
    id: "undercity",
    category: "City",
    clue: "Find the Forsaken capital, hidden beneath the ruins of Lordaeron's old capital.",
    name: "Undercity",
    answer: { x: 0.7126, y: 0.2575 },
    fact: "The Undercity lies under the ruins in Tirisfal Glades and is ruled by Sylvanas Windrunner.",
  },
  {
    id: "booty-bay",
    category: "City",
    clue: "Find the neutral goblin port at the southern tip of Stranglethorn Vale, open to both factions.",
    name: "Booty Bay",
    answer: { x: 0.7365, y: 0.7934 },
    fact: "Booty Bay is run by the Blackwater Raiders and is a neutral hub with boat routes to other ports.",
  },
  {
    id: "blackrock-mountain",
    category: "Raid",
    clue: "Find the volcanic mountain that houses Molten Core, Blackwing Lair and Blackrock Depths.",
    name: "Blackrock Mountain",
    answer: { x: 0.8014, y: 0.5734 },
    fact: "Blackrock Mountain sits between Searing Gorge and Burning Steppes. Ragnaros the Firelord rules Molten Core in its depths.",
  },
  {
    id: "onyxias-lair",
    category: "Raid",
    clue: "Find the lair of Onyxia, the black dragon who posed as Lady Katrana Prestor in Stormwind.",
    name: "Onyxia's Lair",
    answer: { x: 0.2645, y: 0.6287 },
    fact: "Onyxia's Lair is hidden in Dustwallow Marsh. She schemed in Stormwind's court while disguised as a noblewoman.",
  },
  {
    id: "ahn-qiraj",
    category: "Raid",
    clue: "Find the gates of Ahn'Qiraj, sealed behind the Scarab Wall since the War of the Shifting Sands.",
    name: "Ahn'Qiraj",
    answer: { x: 0.1776, y: 0.8353 },
    fact: "The gates stand in Silithus. Ringing the Scarab Gong opens the way into the ancient qiraji temples.",
  },
  {
    id: "karazhan",
    category: "Raid",
    clue: "Find Karazhan, the tower of the Guardian Medivh.",
    name: "Karazhan",
    answer: { x: 0.7814, y: 0.7006 },
    fact: "Karazhan looms over Deadwind Pass in the south of the Eastern Kingdoms.",
  },
  {
    id: "stratholme",
    category: "Dungeon",
    clue: "Find the city where Prince Arthas purged its infected townspeople.",
    name: "Stratholme",
    answer: { x: 0.8234, y: 0.1826 },
    fact: "Stratholme lies in the Eastern Plaguelands and is split between the Scarlet Crusade and the Undead Scourge.",
  },
  {
    id: "scholomance",
    category: "Dungeon",
    clue: "Find the necromantic school beneath the Barov family manor, run by Darkmaster Gandling.",
    name: "Scholomance",
    answer: { x: 0.7884, y: 0.2859 },
    fact: "Scholomance lies beneath Caer Darrow in the Western Plaguelands and trained Cult of the Damned necromancers.",
  },
  {
    id: "wailing-caverns",
    category: "Dungeon",
    clue: "Find the cavern network in the Barrens, corrupted by the Druids of the Fang.",
    name: "Wailing Caverns",
    answer: { x: 0.2046, y: 0.4566 },
    fact: "Naralex the druid sought to restore the Barrens here, but his dream was twisted into the Emerald Nightmare.",
  },
  {
    id: "zul-gurub",
    category: "Raid",
    clue: "Find the troll city in Stranglethorn Vale where the blood god Hakkar the Soulflayer lurks.",
    name: "Zul'Gurub",
    answer: { x: 0.7535, y: 0.7440 },
    fact: "Zul'Gurub is the ancient capital of the Gurubashi trolls, now overrun by the Hakkari.",
  },
  {
    id: "dire-maul",
    category: "Dungeon",
    clue: "Find the ruined city of the Highborne elves, now crawling with satyrs and ogres.",
    name: "Dire Maul",
    answer: { x: 0.1796, y: 0.6916 },
    fact: "Dire Maul stands in Feralas and was once the elven city of Eldre'Thalas.",
  },
  {
    id: "gnomeregan",
    category: "Dungeon",
    clue: "Find the irradiated gnome capital, overrun by troggs after Mekgineer Thermaplugg's betrayal.",
    name: "Gnomeregan",
    answer: { x: 0.7206, y: 0.5240 },
    fact: "Gnomeregan is in Dun Morogh. Its survivors fled to Ironforge and still hope to retake it.",
  },
  {
    id: "deadmines",
    category: "Dungeon",
    clue: "Find the mine below Moonbrook that the Defias Brotherhood uses as its hideout.",
    name: "The Deadmines",
    answer: { x: 0.6986, y: 0.7216 },
    fact: "The Deadmines are in Westfall. Edwin VanCleef rallied the Defias Brotherhood from here.",
  },
  {
    id: "everlook",
    category: "Landmark",
    clue: "Find the neutral goblin outpost high in the snowy mountains of Winterspring.",
    name: "Everlook",
    answer: { x: 0.3054, y: 0.2395 },
    fact: "Everlook is a Steamwheedle Cartel town in Winterspring where both factions can rest and trade.",
  },
  {
    id: "gadgetzan",
    category: "Landmark",
    clue: "Find the goblin trading hub of the Steamwheedle Cartel in the deserts of Tanaris.",
    name: "Gadgetzan",
    answer: { x: 0.2824, y: 0.7515 },
    fact: "Gadgetzan is a neutral desert town and a major hub for adventurers in southern Kalimdor.",
  },
  {
    id: "dark-portal",
    category: "Landmark",
    clue: "Find the gateway through which the orcs first arrived on Azeroth.",
    name: "The Dark Portal",
    answer: { x: 0.7984, y: 0.7485 },
    fact: "The Dark Portal stands in the Blasted Lands. Medivh opened it, and the First War followed.",
  },
  {
    id: "sunken-temple",
    category: "Dungeon",
    clue: "Find the Temple of Atal'Hakkar, a troll temple that sank into a swamp.",
    name: "The Temple of Atal'Hakkar",
    answer: { x: 0.8134, y: 0.6766 },
    fact: "The Sunken Temple lies in the Swamp of Sorrows. The Atal'ai trolls tried to summon Hakkar here.",
  },
];
