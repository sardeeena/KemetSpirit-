// server.ts
import express from "express";

// src/utils/emailTemplate.ts
var EMAIL_LOGO_URL = "https://kemetspirit.com/logo.jpg";
var EMAIL_SUPPORT_EMAIL = "reservation@kemetspirit.com";
function escapeEmailHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}
function renderTextBody(value) {
  const escaped = escapeEmailHtml(value.trim());
  const linked = escaped.replace(
    /https:\/\/[^\s<]+/g,
    (url) => '<a href="' + url + '" style="color:#9b7428;text-decoration:underline;">' + url + "</a>"
  );
  return linked.split(/\n\s*\n/g).map(
    (paragraph) => '<p style="margin:0 0 16px;color:#273449;font-size:15px;line-height:1.75;white-space:pre-line;">' + paragraph.replace(/\n/g, "<br>") + "</p>"
  ).join("");
}
function renderBrandedEmailHtml(options) {
  const heading = escapeEmailHtml(options.heading);
  const preheader = escapeEmailHtml(options.preheader || options.heading);
  const footerNote = options.footerNote ? '<p style="margin:0 0 10px;color:#aab5c5;font-size:11px;line-height:1.6;">' + escapeEmailHtml(options.footerNote) + "</p>" : "";
  return [
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>',
    heading,
    "</title></head>",
    '<body style="margin:0;padding:0;background:#f3f5f8;font-family:Arial,Helvetica,sans-serif;color:#172033;"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">',
    preheader,
    "</div>",
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f5f8;padding:28px 12px;"><tr><td align="center">',
    '<table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #e7ebf0;border-radius:14px;overflow:hidden;">',
    '<tr><td align="center" style="background:#101b2b;padding:26px 24px 22px;"><img src="' + EMAIL_LOGO_URL + '" width="190" alt="KemetSpirit" style="display:block;width:190px;max-width:70%;height:auto;border:0;outline:none;text-decoration:none;"></td></tr>',
    '<tr><td style="padding:34px 34px 20px;"><h1 style="margin:0 0 22px;color:#142238;font-size:24px;line-height:1.3;font-weight:700;">',
    heading,
    "</h1>",
    renderTextBody(options.bodyText),
    "</td></tr>",
    '<tr><td style="padding:0 34px 30px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="border-top:1px solid #e8edf2;padding-top:20px;">',
    '<p style="margin:0 0 7px;color:#172033;font-size:13px;font-weight:700;">KemetSpirit</p><p style="margin:0 0 7px;color:#64748b;font-size:12px;line-height:1.6;">Hurghada, Red Sea, Egypt</p>',
    '<p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">Need assistance? <a href="mailto:' + EMAIL_SUPPORT_EMAIL + '" style="color:#9b7428;text-decoration:underline;">Contact our team</a></p></td></tr></table></td></tr>',
    '<tr><td align="center" style="background:#101b2b;padding:20px 24px;">',
    footerNote,
    '<p style="margin:0;color:#aab5c5;font-size:11px;line-height:1.6;">\xA9 ' + (/* @__PURE__ */ new Date()).getUTCFullYear() + " KemetSpirit. All rights reserved.</p></td></tr>",
    "</table></td></tr></table></body></html>"
  ].join("");
}

// server.ts
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// src/data/toursData.ts
var ALL_TOURS = [
  {
    id: "tour-1",
    slug: "orange-bay-island-snorkeling",
    title: "Orange Bay Island & Snorkeling",
    destination: "Hurghada",
    category: "Boat Trip",
    categories: ["Boat Trip", "Snorkeling", "Island"],
    tourType: "Shared",
    durationCategory: "Full Day",
    durationHours: 7,
    durationLabel: "Full Day (approx. 7 hours)",
    priceEur: 35,
    childPriceEur: 18,
    privatePriceEur: 260,
    rating: 0,
    reviewCount: 0,
    badge: "Popular",
    primaryImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "Take a boat trip to Giftun Island\u2019s Orange Bay beach with shallow turquoise water, two guided snorkeling stops at coral reefs, and buffet lunch onboard.",
    fullDescription: "Spend a relaxing day sailing across the Red Sea to Giftun Island. Disembark at Orange Bay where wooden swings, shallow white sandbars, and shaded beanbag cabanas await. Enjoy two hours of island leisure before re-boarding for a freshly prepared buffet lunch and two distinct open-sea snorkeling sessions over living coral heads.",
    highlights: [
      "2 hours on Orange Bay beach with shaded loungers and shallow turquoise water",
      "Two 45-minute guided snorkeling stops at vibrant offshore reefs",
      "Fresh open buffet lunch served onboard with soft drinks & bottled water",
      "Complimentary snorkeling equipment and flotation jackets provided",
      "Hotel lobby pickup and return across Hurghada included"
    ],
    itinerary: [
      { time: "08:00", title: "Hotel pickup", description: "Air-conditioned transfer from your resort lobby to Hurghada Marina." },
      { time: "09:00", title: "Departure from marina", description: "Safety briefing and scenic sail across the Red Sea toward Giftun Island." },
      { time: "10:00", title: "First snorkeling stop", description: "Guided reef snorkeling session observing parrotfish, rays, and clownfish." },
      { time: "12:30", title: "Lunch onboard", description: "Warm buffet lunch with fish, chicken, rice, salads, and seasonal fruits." },
      { time: "14:00", title: "Island beach time", description: "Disembark at Orange Bay for relaxation, photography, and swimming in shallow lagoons." },
      { time: "16:30", title: "Return to marina", description: "Leisurely cruise back as afternoon sun reflects on coastal mountains." },
      { time: "17:00", title: "Hotel drop-off", description: "Return transfer back to your hotel lobby." }
    ],
    included: [
      "Hotel pickup and return transfer",
      "Full-day boat cruise on passenger yacht",
      "Snorkeling equipment (mask, snorkel, fins)",
      "Orange Bay island national park admission",
      "Buffet lunch prepared fresh onboard",
      "Unlimited soft drinks, mineral water, tea & coffee",
      "Life jackets in adult and child sizes"
    ],
    excluded: [
      "Personal photo & video packages from boat photographer",
      "Beach bar drinks on the island",
      "Tips / gratuities for the crew"
    ],
    whatToBring: [
      "Swimwear and beach towel",
      "Sunscreen (reef-safe recommended)",
      "Sunglasses and sun hat",
      "Comfortable sandals or water shoes",
      "Pocket cash for optional island extras"
    ],
    importantInformation: [
      "Please bring your original passport or hotel card for maritime coast guard check.",
      "Child rate applies to ages 2\u201311. Infants under 2 join free of charge.",
      "Life vests are mandatory for non-swimmers during snorkeling sessions."
    ],
    optionalExtras: [
      { id: "gopro", name: "Underwater GoPro Camera Rental", priceEur: 15, description: "Includes 16GB SD card you take home." },
      { id: "seafood-upgrade", name: "Seafood Platter Upgrade", priceEur: 10, description: "Fresh jumbo grilled prawns and calamari." },
      { id: "private-transfer", name: "Private Hotel Transfer Van", priceEur: 20, description: "Direct pickup without sharing with other resorts." }
    ],
    languages: ["English", "German", "Italian", "Romanian", "Russian", "French"],
    maxGuests: 35,
    pickupAvailable: true,
    pickupInfo: "Complimentary lobby pickup from Hurghada hotels. Small supplement for El Gouna or Makadi Bay.",
    cancellationPolicy: "Free cancellation up to 24 hours prior to departure for a full refund.",
    availableDays: ["Daily"],
    departureTime: "08:00 AM",
    difficulty: "Easy"
  },
  {
    id: "tour-2",
    slug: "paradise-island-snorkeling-trip",
    title: "Paradise Island Snorkeling Trip",
    destination: "Hurghada",
    category: "Boat Trip",
    categories: ["Boat Trip", "Snorkeling", "Island"],
    tourType: "Shared",
    durationCategory: "Full Day",
    durationHours: 7,
    durationLabel: "Full Day (approx. 7 hours)",
    priceEur: 32,
    childPriceEur: 16,
    privatePriceEur: 240,
    rating: 0,
    reviewCount: 0,
    badge: "Great Value",
    primaryImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "Sail to Paradise Beach on Giftun Island with white sand, parasols, folklore dance show, and two coral reef snorkeling stops.",
    fullDescription: "Visit Paradise Beach on Giftun Island for a relaxing beach day. Enjoy 2.5 hours on the white sand with shaded parasols and calm water for swimming. The boat stops at two coral reefs along the way where guides help you spot reef fish, followed by a warm buffet lunch on the yacht.",
    highlights: [
      "2.5 hours at Paradise Beach on Giftun Island",
      "Two stops at protected coral gardens with guide",
      "Oriental folkloric show and music on the beach",
      "Open buffet lunch on the boat with hot drinks",
      "Hotel pickup and drop-off included"
    ],
    itinerary: [
      { time: "08:30", title: "Hotel pickup", description: "Pickup from hotel and transfer to the pier." },
      { time: "09:30", title: "Boat departure", description: "Cruise across the Red Sea towards Giftun Island." },
      { time: "10:30", title: "Reef snorkeling stop", description: "45 minutes over living coral formations." },
      { time: "12:00", title: "Paradise Beach leisure", description: "Sunbathing, beach volleyball, and optional beach bar refreshments." },
      { time: "14:30", title: "Lunch onboard", description: "Fresh buffet served in shaded dining salon." },
      { time: "15:30", title: "Second snorkeling session", description: "Exploring shallow reef pinnacles." },
      { time: "17:00", title: "Return to hotel", description: "Docking and transfer back to hotel." }
    ],
    included: [
      "Hotel pickup and return transfer",
      "Boat cruise and crew assistance",
      "Paradise Island entrance ticket",
      "Snorkeling gear & buoyancy vests",
      "Buffet lunch and soft drinks"
    ],
    excluded: [
      "Island bar drinks",
      "Water sports rides",
      "Tips for crew"
    ],
    whatToBring: ["Beach towel", "Sunscreen", "Swimwear", "Sunglasses", "Cash for island bar"],
    importantInformation: ["Suitable for all age groups including infants and seniors."],
    optionalExtras: [
      { id: "banana-boat", name: "Banana Boat & Tube Ride", priceEur: 8, description: "10 minutes of fun watersports behind speedboat." }
    ],
    languages: ["English", "German", "Italian", "Romanian"],
    maxGuests: 35,
    pickupAvailable: true,
    pickupInfo: "Hotel lobby pickup included across Hurghada.",
    cancellationPolicy: "Free cancellation up to 24 hours prior to tour departure.",
    availableDays: ["Daily"],
    departureTime: "08:30 AM",
    difficulty: "Easy"
  },
  {
    id: "tour-3",
    slug: "dolphin-house-snorkeling",
    title: "Dolphin House Snorkeling",
    destination: "Hurghada",
    category: "Snorkeling",
    categories: ["Snorkeling", "Boat Trip"],
    tourType: "Shared",
    durationCategory: "Full Day",
    durationHours: 7.5,
    durationLabel: "Full Day (approx. 7.5 hours)",
    priceEur: 40,
    childPriceEur: 20,
    privatePriceEur: 310,
    rating: 0,
    reviewCount: 0,
    primaryImage: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "Take a boat trip to Shaab El Erg reef to see wild dolphins in open water, with two coral snorkeling stops and lunch.",
    fullDescription: "Shaab El Erg is a protected reef where pods of spinner dolphins rest and swim. We travel by comfortable boat to observe dolphins in their natural environment without chasing. Guided snorkeling stops follow over colorful coral reefs, with an open buffet lunch and water sports onboard.",
    highlights: [
      "Observe pods of wild dolphins in their natural habitat",
      "Two guided reef snorkeling stops with marine guides",
      "Sanitized premium masks, fins, and life jackets",
      "Hot buffet lunch and unlimited refreshments onboard",
      "Banana boat and sofa water ride included"
    ],
    itinerary: [
      { time: "08:00", title: "Hotel pickup", description: "Air-conditioned transfer from your resort." },
      { time: "09:00", title: "Departure from marina", description: "Cruising toward Shaab El Erg reef." },
      { time: "10:30", title: "Dolphin observation lagoon", description: "Search and swimming opportunities near dolphin pods." },
      { time: "12:30", title: "Lunch onboard", description: "Fresh hot buffet prepared by onboard chef." },
      { time: "13:45", title: "Reef snorkeling stop", description: "Guided exploration of vibrant coral walls." },
      { time: "15:15", title: "Water sports fun", description: "Banana boat and sofa ride behind speedboat." },
      { time: "16:30", title: "Return to marina", description: "Disembarkation and hotel transfer." }
    ],
    included: [
      "Hotel pickup and return transfer",
      "Full-day boat cruise",
      "Snorkeling gear & life jackets",
      "Marine park environmental fees",
      "Hot buffet lunch & soft drinks",
      "Water sports inflatables"
    ],
    excluded: ["Professional video/photo album", "Crew gratuities"],
    whatToBring: ["Towel", "Swimsuit", "Sun protection", "Camera"],
    importantInformation: ["Dolphin encounters are natural and cannot be 100% guaranteed, but success rate is high."],
    optionalExtras: [
      { id: "photo-pkg", name: "Professional Underwater Photos", priceEur: 20, description: "Delivered digitally by evening." }
    ],
    languages: ["English", "German", "Italian", "Romanian", "French", "Russian"],
    maxGuests: 30,
    pickupAvailable: true,
    pickupInfo: "Pickup from Hurghada resorts between 07:45 - 08:30 AM.",
    cancellationPolicy: "Free cancellation up to 24 hours prior to departure.",
    availableDays: ["Daily"],
    departureTime: "08:00 AM",
    difficulty: "Easy"
  },
  {
    id: "tour-4",
    slug: "giftun-island-boat-trip",
    title: "Giftun Island Boat Trip",
    destination: "Hurghada",
    category: "Boat Trip",
    categories: ["Boat Trip", "Island"],
    tourType: "Shared",
    durationCategory: "Full Day",
    durationHours: 7,
    durationLabel: "Full Day (approx. 7 hours)",
    priceEur: 30,
    childPriceEur: 15,
    privatePriceEur: 230,
    rating: 0,
    reviewCount: 0,
    badge: "Classic",
    primaryImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "The classic Red Sea boat trip featuring sandbar swimming on Giftun Island National Park, relaxing on sun decks, and snorkeling over living coral.",
    fullDescription: "Giftun Island is the classic island-and-reef experience. Set out from the marina on a spacious double-decker boat, soak up the sun on open decks, and spend over an hour on the island\u2019s sandy shores before heading to two prime snorkeling reefs.",
    highlights: [
      "Relaxation on Giftun Island National Park sandbars",
      "Two coral snorkeling sessions with guide",
      "Open buffet lunch and refreshments included",
      "Hotel pickup and drop-off included"
    ],
    itinerary: [
      { time: "08:30", title: "Pickup from hotel", description: "Lobby pickup and transfer to boat pier." },
      { time: "09:30", title: "Cruise departure", description: "Scenic sail across calm coastal waters." },
      { time: "11:00", title: "Giftun Island stop", description: "Swim and relax on the sandy beach." },
      { time: "13:00", title: "Buffet lunch", description: "Warm lunch onboard." },
      { time: "14:15", title: "Reef snorkeling", description: "Exploring colorful coral gardens." },
      { time: "16:00", title: "Return cruise", description: "Sail back to Hurghada pier." }
    ],
    included: ["Hotel transfers", "Boat trip & national park fee", "Snorkeling equipment", "Lunch & soft drinks"],
    excluded: ["Personal expenses", "Tips"],
    whatToBring: ["Beach towel", "Swimwear", "Sunscreen"],
    importantInformation: ["Family-friendly trip suitable for all swimming levels."],
    languages: ["English", "German", "Russian"],
    maxGuests: 35,
    pickupAvailable: true,
    pickupInfo: "Lobby pickup included.",
    cancellationPolicy: "Free cancellation up to 24 hours before tour start.",
    availableDays: ["Daily"],
    departureTime: "08:30 AM",
    difficulty: "Easy"
  },
  {
    id: "tour-5",
    slug: "desert-quad-safari",
    title: "Desert Quad Safari",
    destination: "Hurghada",
    category: "Safari",
    categories: ["Safari", "Quad"],
    tourType: "Shared",
    durationCategory: "Half Day",
    durationHours: 3.5,
    durationLabel: "Half Day (approx. 3.5 hours)",
    priceEur: 28,
    childPriceEur: 15,
    privatePriceEur: 160,
    rating: 0,
    reviewCount: 0,
    badge: "Adventure",
    primaryImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "Ride a 250cc ATV quad bike across desert trails and mountain canyons. Includes test drive and Bedouin tea.",
    fullDescription: "Drive a quad bike through the Eastern Desert near Hurghada. After a safety briefing and practice drive at the safari center, follow your guide through wide gravel trails and natural valleys framed by mountains. Stop at a Bedouin tent for herbal tea and rest before riding back.",
    highlights: [
      "Dedicated single quad bike for each participant",
      "Comprehensive safety test drive and instruction",
      "Approximately 45km total riding through scenic desert trails",
      "Traditional Bedouin herbal tea stop",
      "Round-trip hotel transfer included"
    ],
    itinerary: [
      { time: "08:00 or 14:00", title: "Hotel pickup", description: "Air-conditioned transfer to desert base station." },
      { time: "08:45 or 14:45", title: "Safety briefing & test drive", description: "Learn controls and practice in enclosed training yard." },
      { time: "09:15 or 15:15", title: "Quad trail ride", description: "Guided convoy across wide sand plains and rocky valleys." },
      { time: "10:30 or 16:30", title: "Bedouin tent break", description: "Rest, herbal tea, and photo opportunities." },
      { time: "11:15 or 17:15", title: "Return ride & hotel drop-off", description: "Ride back to safari center and transfer to hotel." }
    ],
    included: ["Hotel transfers", "Single quad bike per driver", "Safety helmet & instructor", "Bedouin tea & water"],
    excluded: ["Dust scarf & goggles (rent for \u20AC3 or bring own)", "Photo CD"],
    whatToBring: ["Closed shoes / sneakers", "Comfortable clothes (will get dusty)", "Sunglasses"],
    importantInformation: ["Minimum driving age for quad is 16 years. Children can ride as passengers with parents."],
    languages: ["English", "German", "French", "Russian"],
    maxGuests: 20,
    pickupAvailable: true,
    pickupInfo: "Morning or afternoon departure options available.",
    cancellationPolicy: "Free cancellation up to 24 hours prior to departure.",
    availableDays: ["Daily"],
    departureTime: "08:00 AM or 02:00 PM",
    difficulty: "Adventurous"
  },
  {
    id: "tour-6",
    slug: "desert-safari-bedouin-experience",
    title: "Desert Safari & Bedouin Experience",
    destination: "Hurghada",
    category: "Safari",
    categories: ["Safari", "Quad"],
    tourType: "Shared",
    durationCategory: "Half Day",
    durationHours: 5,
    durationLabel: "Half Day (approx. 5 hours)",
    priceEur: 35,
    childPriceEur: 18,
    privatePriceEur: 210,
    rating: 0,
    reviewCount: 0,
    badge: "Sunset Special",
    primaryImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "Quad biking, spider dune buggy driving, camel ride, Bedouin village visit, BBQ dinner, and evening folklore show.",
    fullDescription: "An afternoon and evening tour in the desert. Drive a quad bike and dune buggy, visit a Bedouin village to see how bread is baked on iron plates, ride a camel at sunset, and dine on an open-air barbecue buffet with music and folklore performances.",
    highlights: [
      "ATV quad ride and spider dune buggy drive",
      "Authentic Bedouin village tour with bread making demonstration",
      "Sunset camel ride across desert ridges",
      "Barbecue buffet dinner with soft drinks included",
      "Evening fire show and folkloric Tanoura performance"
    ],
    itinerary: [
      { time: "13:30", title: "Hotel pickup", description: "Transfer from resort lobby to safari station." },
      { time: "14:30", title: "Quad & buggy drives", description: "Action-packed driving across desert trails." },
      { time: "16:00", title: "Bedouin village arrival", description: "Tour village, pharmacy, and taste fresh flatbread." },
      { time: "17:00", title: "Sunset camel ride", description: "Scenic ride as sun sinks behind mountain ridge." },
      { time: "18:00", title: "BBQ dinner & show", description: "Open-air buffet dinner and folkloric show." },
      { time: "19:30", title: "Return transfer", description: "Drop-off at your hotel." }
    ],
    included: ["Round-trip transfers", "Quad bike & spider buggy", "Bedouin guide & camel ride", "BBQ dinner & drinks", "Show"],
    excluded: ["Scarf & goggles rental", "Personal photos"],
    whatToBring: ["Comfortable clothing", "Closed footwear", "Light jacket for evening"],
    importantInformation: ["Suitable for couples, groups, and families with children aged 4+."],
    languages: ["English", "German", "Italian", "French"],
    maxGuests: 25,
    pickupAvailable: true,
    pickupInfo: "Afternoon pickup directly from hotel.",
    cancellationPolicy: "Free cancellation up to 24 hours before tour.",
    availableDays: ["Daily"],
    departureTime: "01:30 PM",
    difficulty: "Adventurous"
  },
  {
    id: "tour-7",
    slug: "private-red-sea-yacht",
    title: "Private Red Sea Yacht",
    destination: "Hurghada",
    category: "Private Tour",
    categories: ["Private Tour", "Boat Trip"],
    tourType: "Private",
    durationCategory: "Full Day",
    durationHours: 8,
    durationLabel: "Full Day (approx. 8 hours)",
    priceEur: 250,
    childPriceEur: 0,
    privatePriceEur: 250,
    rating: 0,
    reviewCount: 0,
    badge: "VIP Private",
    primaryImage: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "Private yacht charter for up to 8 guests. Choose your stops, snorkel quiet reefs, and enjoy a freshly cooked lunch.",
    fullDescription: "Rent a private yacht exclusively for your family or friends. Your captain coordinates the route according to your wishes\u2014visit secluded sandbars, Orange Bay, or quiet snorkeling reefs away from crowds. The onboard cook prepares a fresh lunch while you swim and relax on the sun deck.",
    highlights: [
      "Exclusive private yacht for your party only (up to 8 guests)",
      "Customized route: Orange Bay, Magawish, or Dolphin Reefs",
      "Private onboard chef preparing fresh gourmet lunch",
      "Snorkeling gear, fresh tropical fruits, and unlimited drinks",
      "Private Mercedes / minivan hotel transfers included"
    ],
    itinerary: [
      { time: "09:00", title: "Private hotel transfer", description: "Direct pickup in private executive vehicle." },
      { time: "09:45", title: "Boarding & captain consultation", description: "Discuss preferred stops and customize your itinerary." },
      { time: "10:30", title: "Secluded reef snorkeling", description: "Anchor at quiet reef away from group boats." },
      { time: "13:00", title: "Fresh gourmet lunch", description: "Seafood and barbecue prepared by private cook." },
      { time: "14:30", title: "Sandbar or island stop", description: "Swim in shallow turquoise waters at your leisure." },
      { time: "16:45", title: "Sunset cruise to marina", description: "Champagne or fresh juice toast during return sail." }
    ],
    included: ["Entire private yacht charter", "Captain and 2 crew members", "Private chef lunch & drinks", "All park fees & snorkeling gear", "Private hotel transfers"],
    excluded: ["Crew gratuities (discretionary)"],
    whatToBring: ["Swimwear", "Towels", "Sunglasses", "Camera"],
    importantInformation: ["Price is total for the entire vessel (up to 8 guests included). Extra guests \u20AC25/person."],
    languages: ["English", "German", "Arabic", "French"],
    maxGuests: 8,
    pickupAvailable: true,
    pickupInfo: "Custom pickup time available between 08:30 and 10:00 AM.",
    cancellationPolicy: "Free cancellation up to 48 hours prior to charter.",
    availableDays: ["Daily"],
    departureTime: "09:00 AM (Flexible)",
    difficulty: "Easy"
  },
  {
    id: "tour-8",
    slug: "el-gouna-private-boat-trip",
    title: "El Gouna Private Boat Trip",
    destination: "El Gouna",
    category: "Private Tour",
    categories: ["Private Tour", "Boat Trip"],
    tourType: "Private",
    durationCategory: "Full Day",
    durationHours: 6,
    durationLabel: "Full Day (approx. 6 hours)",
    priceEur: 220,
    childPriceEur: 0,
    privatePriceEur: 220,
    rating: 0,
    reviewCount: 0,
    badge: "Boutique",
    primaryImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "Private cruiser departing Abu Tig Marina. Cruise through El Gouna channels, visit quiet northern reefs, and relax on sandbars.",
    fullDescription: "Depart directly from Abu Tig Marina in El Gouna on a private boat for up to 6 guests. Cruise along lagoon waterways into open water to snorkel northern reefs known for clear visibility and marine life. Includes soft drinks, fruit platter, and snorkeling gear.",
    highlights: [
      "Direct departure from Abu Tig Marina in El Gouna",
      "Private boat with sun shade and swimming ladder",
      "Explore quiet northern coral reefs and shallow sandbars",
      "Flexible departure time for your group",
      "Snorkeling equipment and cold drinks included"
    ],
    itinerary: [
      { time: "09:30", title: "Pickup or Marina meet", description: "Meet captain at Abu Tig Marina Berth 4." },
      { time: "10:00", title: "Lagoon & coastal cruise", description: "Scenic pass through El Gouna channels." },
      { time: "11:00", title: "First reef stop", description: "Snorkeling over pristine northern corals." },
      { time: "13:00", title: "Sandbar lunch break", description: "Sandwiches, fresh fruit platter, and cold drinks." },
      { time: "14:30", title: "Second snorkeling stop", description: "Search for turtles and rays in calm waters." },
      { time: "16:00", title: "Return to Abu Tig Marina", description: "Docking and transfer." }
    ],
    included: ["Private boat and captain", "Fuel and marina permits", "Snorkeling equipment", "Fruit platter & soft drinks", "Hotel transfer in El Gouna"],
    excluded: ["Full warm restaurant lunch (can stop at beach club upon request)"],
    whatToBring: ["Beach wear", "Towel", "Sunscreen"],
    importantInformation: ["Rate is per boat for up to 6 passengers."],
    languages: ["English", "German"],
    maxGuests: 6,
    pickupAvailable: true,
    pickupInfo: "Pickup from all El Gouna hotels included.",
    cancellationPolicy: "Free cancellation up to 24 hours prior to departure.",
    availableDays: ["Daily"],
    departureTime: "09:30 AM",
    difficulty: "Easy"
  },
  {
    id: "tour-9",
    slug: "introductory-scuba-diving-experience",
    title: "Introductory Scuba Diving Experience",
    destination: "Hurghada",
    category: "Diving",
    categories: ["Diving", "Boat Trip"],
    tourType: "Shared",
    durationCategory: "Full Day",
    durationHours: 8,
    durationLabel: "Full Day (approx. 8 hours)",
    priceEur: 65,
    childPriceEur: 45,
    privatePriceEur: 340,
    rating: 0,
    reviewCount: 0,
    badge: "Instructor Led",
    primaryImage: "https://images.unsplash.com/photo-1544551763-92ab472cad5d?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1544551763-92ab472cad5d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "No license needed. Try scuba diving with a certified PADI instructor by your side. Includes 2 shallow boat dives and lunch.",
    fullDescription: "Designed for complete beginners who want to try scuba diving safely. On the cruise out, your instructor explains breathing, equalizing, and hand signals. You do two separate 20-minute shallow dives (max 6-7 meters) with your instructor holding your hand throughout. Between dives, relax on the sun deck and enjoy lunch.",
    highlights: [
      "No previous diving experience or swimming expertise required",
      "Two separate shallow dives with your own instructor",
      "Safe maximum depth of 6 to 7 meters",
      "Clean dive equipment, wetsuit, mask, and fins included",
      "Full-day boat cruise with open buffet lunch"
    ],
    itinerary: [
      { time: "08:00", title: "Hotel transfer", description: "Pickup and transfer to dive boat." },
      { time: "09:00", title: "Departure & theory briefing", description: "Instructor explains breathing, equalization, and hand signals." },
      { time: "10:30", title: "First introductory dive", description: "20 minutes hand-in-hand underwater at shallow reef." },
      { time: "12:30", title: "Buffet lunch onboard", description: "Rest on sun deck and enjoy warm lunch." },
      { time: "14:00", title: "Second dive or snorkeling", description: "Second guided dive exploring coral pinnacle." },
      { time: "16:30", title: "Return to harbor", description: "Docking and transfer back to hotel." }
    ],
    included: ["Hotel transfers", "Two intro dives with 1-on-1 instructor", "Full scuba equipment set", "Buffet lunch & drinks", "Marine conservation permit"],
    excluded: ["Underwater photo/video package", "Tips for dive crew"],
    whatToBring: ["Swimwear", "Towel", "Dry clothes"],
    importantInformation: ["Must be at least 10 years old. Medical questionnaire required before diving (must not have severe asthma or heart conditions)."],
    languages: ["English", "German", "Russian", "French"],
    maxGuests: 15,
    pickupAvailable: true,
    pickupInfo: "Pickup from Hurghada hotels around 08:00 AM.",
    cancellationPolicy: "Free cancellation up to 24 hours prior to departure.",
    availableDays: ["Daily"],
    departureTime: "08:00 AM",
    difficulty: "Moderate",
    ageRestrictions: "Minimum age 10 years"
  },
  {
    id: "tour-10",
    slug: "marsa-alam-dolphin-house",
    title: "Marsa Alam Dolphin House",
    destination: "Marsa Alam",
    category: "Snorkeling",
    categories: ["Snorkeling", "Boat Trip"],
    tourType: "Shared",
    durationCategory: "Full Day",
    durationHours: 8,
    durationLabel: "Full Day (approx. 8 hours)",
    priceEur: 55,
    childPriceEur: 28,
    privatePriceEur: 380,
    rating: 0,
    reviewCount: 0,
    badge: "Marine Reserve",
    primaryImage: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "Sail to the protected Sha\u2019ab Samadai marine reserve to snorkel near wild dolphins in calm natural lagoons.",
    fullDescription: "Sha\u2019ab Samadai is a protected marine reserve in southern Egypt where families of spinner dolphins rest in natural lagoons. Snorkel in the designated lagoon zone with marine guides, then explore outer coral drop-offs. Includes hotel pickup across Marsa Alam and lunch onboard.",
    highlights: [
      "Protected national marine park with regulated dolphin access",
      "High chance to see spinner dolphins in calm waters",
      "Two guided snorkeling stops accompanied by marine guides",
      "Hot buffet lunch and cold drinks on the boat",
      "Hotel pickup and drop-off across Marsa Alam included"
    ],
    itinerary: [
      { time: "07:30", title: "Hotel pickup", description: "Transfer to Marsa Alam marina pier." },
      { time: "08:30", title: "Sail to Samadai Reef", description: "Cruising toward the offshore horseshoe reef." },
      { time: "10:00", title: "First dolphin snorkeling", description: "Snorkeling in the designated tourist zone of Samadai." },
      { time: "12:30", title: "Buffet lunch onboard", description: "Warm lunch served on the boat." },
      { time: "14:00", title: "Second coral reef stop", description: "Explore steep coral walls on the outer reef." },
      { time: "16:00", title: "Return to marina", description: "Transfer back to hotel." }
    ],
    included: ["Hotel pickup and drop-off", "Boat trip to Samadai", "National Park permit fee", "Snorkeling equipment", "Buffet lunch & drinks"],
    excluded: ["Photo album", "Gratuities"],
    whatToBring: ["Towel", "Swimsuit", "Reef-safe sunscreen", "Sunglasses"],
    importantInformation: ["Touching or chasing dolphins is strictly prohibited by Egyptian environmental law."],
    languages: ["English", "German", "Italian"],
    maxGuests: 25,
    pickupAvailable: true,
    pickupInfo: "Lobby pickup from Marsa Alam hotels.",
    cancellationPolicy: "Free cancellation up to 24 hours prior to departure.",
    availableDays: ["Daily"],
    departureTime: "07:30 AM",
    difficulty: "Easy"
  },
  {
    id: "tour-11",
    slug: "sharm-el-naga-beach-reef-day",
    title: "Sharm El Naga Beach & Snorkeling Day",
    destination: "Safaga",
    category: "Snorkeling",
    categories: ["Snorkeling", "Island"],
    tourType: "Shared",
    durationCategory: "Full Day",
    durationHours: 7,
    durationLabel: "Full Day (approx. 7 hours)",
    priceEur: 38,
    childPriceEur: 20,
    privatePriceEur: 220,
    rating: 0,
    reviewCount: 0,
    badge: "Shore Entry",
    primaryImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "Snorkel straight from a sandy beach without a boat. Includes private bay entry, sun loungers, swimming pool, and lunch.",
    fullDescription: "Sharm El Naga is a protected bay south of Hurghada where coral reefs grow just a few meters from the shore. Ideal for families, children, and travelers who prefer walking into the water from the beach rather than taking a boat. Loungers, freshwater pool, and restaurant buffet lunch are included.",
    highlights: [
      "Direct beach-entry snorkeling without needing a boat",
      "Access to fresh-water swimming pool, showers, and shaded loungers",
      "Buffet lunch served at beachfront restaurant",
      "Snorkeling gear and guide included"
    ],
    itinerary: [
      { time: "08:30", title: "Hotel transfer", description: "Air-conditioned transfer to Sharm El Naga bay." },
      { time: "09:30", title: "Beach arrival & briefing", description: "Settle into loungers and receive snorkeling equipment." },
      { time: "10:30", title: "Guided shore snorkeling", description: "Explore the drop-off with guide." },
      { time: "13:00", title: "Beachfront buffet lunch", description: "Hot lunch at the reserve restaurant." },
      { time: "14:30", title: "Free beach & pool time", description: "Relaxation and secondary snorkeling." },
      { time: "16:00", title: "Return transfer", description: "Drop-off at your hotel." }
    ],
    included: ["Round-trip transfer", "Reserve entrance ticket", "Beach loungers & pool use", "Snorkeling equipment", "Buffet lunch"],
    excluded: ["Drinks at restaurant", "Camel riding on beach"],
    whatToBring: ["Beach towel", "Swimwear", "Sunscreen"],
    importantInformation: ["Great for young children and travelers prone to seasickness."],
    languages: ["English", "German"],
    maxGuests: 30,
    pickupAvailable: true,
    pickupInfo: "Pickup from Hurghada, Sahl Hasheesh, and Makadi Bay hotels.",
    cancellationPolicy: "Free cancellation up to 24 hours prior to departure.",
    availableDays: ["Daily"],
    departureTime: "08:30 AM",
    difficulty: "Easy"
  },
  {
    id: "tour-12",
    slug: "sahl-hasheesh-glass-bottom-boat",
    title: "Sahl Hasheesh Glass Bottom Boat",
    destination: "Sahl Hasheesh",
    category: "Water Sports",
    categories: ["Water Sports", "Boat Trip"],
    tourType: "Shared",
    durationCategory: "Half Day",
    durationHours: 2.5,
    durationLabel: "Half Day (approx. 2.5 hours)",
    priceEur: 25,
    childPriceEur: 12,
    privatePriceEur: 140,
    rating: 0,
    reviewCount: 0,
    badge: "Family Favorite",
    primaryImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "View corals and fish through underwater glass windows without getting wet. Sail past sunken pillars with an optional swim stop.",
    fullDescription: "Great for children, non-swimmers, and anyone wanting a short 2.5-hour trip. Look through deep panoramic glass panels to watch coral reefs and marine life in calm bay waters. Includes a short swimming stop and hotel transfer.",
    highlights: [
      "Large submerged glass viewing windows",
      "Cruise past Sahl Hasheesh sunken columns",
      "Ideal for small children and non-swimmers",
      "Short 2.5-hour tour with hotel pickup"
    ],
    itinerary: [
      { time: "10:00 or 14:00", title: "Hotel pickup", description: "Transfer to Sahl Hasheesh pier." },
      { time: "10:30 or 14:30", title: "Boarding & glass viewing", description: "Cruise over living reefs and sunken columns." },
      { time: "11:45 or 15:45", title: "Optional swim stop", description: "Jump into shallow calm water or stay on sun deck." },
      { time: "12:30 or 16:30", title: "Return transfer", description: "Back to hotel." }
    ],
    included: ["Hotel transfers", "Glass bottom boat cruise", "Soft drinks and water"],
    excluded: ["Personal photos"],
    whatToBring: ["Sunglasses", "Camera"],
    importantInformation: ["Stroller friendly and completely safe for all ages."],
    languages: ["English", "German", "Russian"],
    maxGuests: 25,
    pickupAvailable: true,
    pickupInfo: "Pickup from Sahl Hasheesh, Makadi Bay, and Hurghada.",
    cancellationPolicy: "Free cancellation up to 24 hours prior to departure.",
    availableDays: ["Daily"],
    departureTime: "10:00 AM or 02:00 PM",
    difficulty: "Easy"
  },
  {
    id: "ras-mohammed-white-island-cruise",
    slug: "ras-mohammed-white-island-cruise",
    title: "Ras Mohammed National Park & White Island Luxury Yacht Cruise",
    destination: "Sharm El-Sheikh",
    category: "Boat Trips",
    categories: ["Boat Trips", "Snorkeling", "Island Visits"],
    tourType: "Shared",
    durationCategory: "Full Day",
    durationHours: 8,
    durationLabel: "Full Day (approx. 8 hours)",
    priceEur: 45,
    childPriceEur: 25,
    privatePriceEur: 380,
    rating: 0,
    reviewCount: 0,
    primaryImage: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"
    ],
    shortDescription: "Cruise through the marine sanctuary of Ras Mohammed National Park, step onto the crystal sandbar of White Island, snorkel coral walls, and enjoy an onboard seafood buffet.",
    fullDescription: "Sail along the dramatic coastline of South Sinai into the protected marine sanctuary of Ras Mohammed National Park. Cruise to the famous White Island sandbar, explore vibrant coral reef walls, and enjoy a freshly prepared open seafood & grill buffet onboard.",
    highlights: [
      "Cruise to Ras Mohammed National Park, Egypt\u2019s oldest protected marine reserve",
      "Walk on the pristine shifting sands of White Island",
      "Two guided reef drop-off snorkeling sessions at Shark & Yolanda Reefs",
      "Freshly prepared onboard buffet with seafood, grilled chicken, and fresh salads",
      "Complimentary hotel pickup and drop-off from any resort in Sharm El-Sheikh"
    ],
    itinerary: [
      { time: "08:00", title: "Hotel Pickup", description: "Air-conditioned transfer from your Sharm resort to the marina." },
      { time: "09:00", title: "Yacht Departure", description: "Welcome briefing, safety orientation, and cruise out towards South Sinai." },
      { time: "10:30", title: "First Snorkeling Session", description: "Guided exploration along protected coral reef walls with clownfish and sea turtles." },
      { time: "12:00", title: "White Island Sandbar Stop", description: "Tender boat transfer to the turquoise shallows and sandbar of White Island." },
      { time: "13:30", title: "Fresh Buffet Lunch Onboard", description: "Generous open buffet featuring grilled fish, chicken, pastas, and oriental mezze." },
      { time: "14:45", title: "Second Snorkeling Stop", description: "Afternoon swim among sea fans and schooling anthias." },
      { time: "16:30", title: "Return to Marina & Hotel Drop-off", description: "Scenic sail back to Sharm El-Sheikh and transfer back to your lobby." }
    ],
    included: [
      "Hotel pickup and return across all Sharm El-Sheikh resorts",
      "National park entry permit and marine clearance",
      "Open buffet lunch (seafood, grilled meats, salads, pastas)",
      "Unlimited tea, coffee, mineral water, and soft drinks throughout the day",
      "Professional certified snorkeling guide and buoyancy aids"
    ],
    excluded: [
      "Snorkeling gear rental (masks & fins available at marina for \u20AC5)",
      "Professional underwater photo & video package"
    ],
    whatToBring: ["Swimwear", "Beach towel", "Passport or ID photocopy", "Sunscreen (reef safe)", "Sunglasses & hat"],
    importantInformation: [
      "Please bring a passport photocopy as required by Egyptian Coast Guard regulations.",
      "White Island visibility is subject to daily tidal conditions and sea clearance."
    ],
    languages: ["English", "German", "Russian", "Italian"],
    maxGuests: 30,
    pickupAvailable: true,
    pickupInfo: "Complimentary lobby pickup from all hotels in Sharm El-Sheikh (Naama Bay, Nabq, Sharks Bay, Hadaba, Ras Um Sid).",
    cancellationPolicy: "Free cancellation up to 24 hours prior to departure with 100% refund.",
    availableDays: ["Daily"],
    departureTime: "08:00 AM",
    difficulty: "Easy"
  }
];
function countToursForCategory(categoryName) {
  const aliases = {
    "Boat Trips": ["Boat Trip", "Boat Trips", "Island", "Island Visits"],
    "Private Tours": ["Private Tour", "Private Tours"],
    Safari: ["Safari", "Quad"]
  };
  const names = aliases[categoryName] || [categoryName];
  return ALL_TOURS.filter(
    (tour) => names.some((name) => tour.category === name || tour.categories.includes(name))
  ).length;
}
var POPULAR_DESTINATIONS = [
  {
    id: "dest-hurghada",
    name: "Hurghada",
    slug: "hurghada",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    tagline: "Main departure hub for boat trips and coral reefs",
    tourCount: ALL_TOURS.filter((tour) => tour.destination === "Hurghada").length,
    description: "The main resort city on the Red Sea with direct boat trips to Giftun Island, Orange Bay, and desert safari centers.",
    highlights: ["Giftun Island Marine Reserve", "Orange Bay & Paradise Beach", "Direct marina departures"],
    distanceFromAirport: "15 mins from Hurghada Airport (HRG)"
  },
  {
    id: "dest-elgouna",
    name: "El Gouna",
    slug: "el-gouna",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    tagline: "Quiet lagoon town with marinas and private boat charters",
    tourCount: ALL_TOURS.filter((tour) => tour.destination === "El Gouna").length,
    description: "A quiet resort town 30 minutes north of Hurghada, connected by lagoons, with private yacht charters from Abu Tig Marina.",
    highlights: ["Abu Tig Marina departures", "Lagoon boat tours", "Private yacht charters"],
    distanceFromAirport: "30 mins north of Hurghada (HRG)"
  },
  {
    id: "dest-makadibay",
    name: "Makadi Bay",
    slug: "makadi-bay",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    tagline: "Calm bay with house reefs right off the beach",
    tourCount: ALL_TOURS.filter((tour) => tour.destination === "Makadi Bay").length,
    description: "Located south of Hurghada with house reefs right in front of the hotels, great for snorkeling from the shore and desert tours.",
    highlights: ["Shore snorkeling from piers", "Desert quad trail access", "Calm waters for families"],
    distanceFromAirport: "25 mins south of Hurghada (HRG)"
  },
  {
    id: "dest-sahlhasheesh",
    name: "Sahl Hasheesh",
    slug: "sahl-hasheesh",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    tagline: "Relaxed resort bay with walking promenade and glass bottom boats",
    tourCount: ALL_TOURS.filter((tour) => tour.destination === "Sahl Hasheesh").length,
    description: "A relaxed bay with a pedestrian promenade, calm waters, sunken pharaonic pillars, and glass-bottom boat trips.",
    highlights: ["Sunken columns", "Quiet coral reefs", "Promenade pier"],
    distanceFromAirport: "20 mins south of Hurghada (HRG)"
  },
  {
    id: "dest-safaga",
    name: "Safaga",
    slug: "safaga",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    tagline: "Wide bays and Sharm El Naga beach nature reserve",
    tourCount: ALL_TOURS.filter((tour) => tour.destination === "Safaga").length,
    description: "A quieter coastal area south of Hurghada, home to the protected Sharm El Naga marine bay where you snorkel right from the sand.",
    highlights: ["Sharm El Naga protected bay", "Sandy beaches", "Quiet boat trips"],
    distanceFromAirport: "45 mins south of Hurghada (HRG)"
  },
  {
    id: "dest-marsaalam",
    name: "Marsa Alam",
    slug: "marsa-alam",
    image: "https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=800&q=80",
    tagline: "Protected marine bays with sea turtles and wild dolphins",
    tourCount: ALL_TOURS.filter((tour) => tour.destination === "Marsa Alam").length,
    description: "Egypt\u2019s southern marine destination where wild spinner dolphins, sea turtles, and untouched reefs thrive.",
    highlights: ["Abu Dabbab turtle bay", "Sataya dolphin reef", "Samadai dolphin house"],
    distanceFromAirport: "10-45 mins from Marsa Alam Airport (RMF)"
  },
  {
    id: "dest-sharmelsheikh",
    name: "Sharm El-Sheikh",
    slug: "sharm-el-sheikh",
    image: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=800&q=80",
    tagline: "Sinai marine jewel with Ras Mohammed drop-offs & White Island",
    tourCount: ALL_TOURS.filter((tour) => tour.destination === "Sharm El-Sheikh").length,
    description: "The premier resort of the southern Sinai peninsula, famed for dramatic drop-off reef walls at Ras Mohammed National Park, the crystal waters of White Island, and the straits of Tiran.",
    highlights: ["Ras Mohammed National Park", "White Island sandbar cruise", "Straits of Tiran reefs", "Naama Bay marina departures"],
    distanceFromAirport: "15 mins from Sharm El-Sheikh Airport (SSH)"
  }
];
var TOUR_CATEGORIES = [
  {
    id: "cat-boat-trips",
    name: "Boat Trips",
    slug: "boat-trips",
    iconName: "Ship",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
    tourCount: countToursForCategory("Boat Trips"),
    description: "Full-day motor yachts, catamarans, and island-hopping trips with sun decks and open buffet lunches."
  },
  {
    id: "cat-snorkeling",
    name: "Snorkeling",
    slug: "snorkeling",
    iconName: "Waves",
    image: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=600&q=80",
    tourCount: countToursForCategory("Snorkeling"),
    description: "Guided encounters with clownfish, rays, and sea turtles over vibrant shallow coral gardens."
  },
  {
    id: "cat-diving",
    name: "Diving",
    slug: "diving",
    iconName: "Compass",
    image: "https://images.unsplash.com/photo-1544551763-92ab472cad5d?auto=format&fit=crop&w=600&q=80",
    tourCount: countToursForCategory("Diving"),
    description: "Certified 2-tank boat dives and beginner intro discovery dives led by PADI divemasters."
  },
  {
    id: "cat-safari",
    name: "Safari",
    slug: "safari",
    iconName: "Sun",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80",
    tourCount: countToursForCategory("Safari"),
    description: "ATV quad biking through Red Sea mountain canyons, Bedouin camp visits, camel rides & stargazing."
  },
  {
    id: "cat-private",
    name: "Private Tours",
    slug: "private-tours",
    iconName: "Anchor",
    image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=600&q=80",
    tourCount: countToursForCategory("Private Tours"),
    description: "Tailored private yachts and high-speed RIBs for couples, families, and custom itineraries."
  },
  {
    id: "cat-watersports",
    name: "Water Sports",
    slug: "water-sports",
    iconName: "Waves",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    tourCount: countToursForCategory("Water Sports"),
    description: "Parasailing, glass-bottom boats, and banana boat adventures for the entire family."
  }
];

// src/data/chatKnowledge.ts
var TOUR_CATALOG_SUMMARY = ALL_TOURS.map((t) => ({
  id: t.id,
  slug: t.slug,
  title: t.title,
  destination: t.destination,
  category: t.category,
  categories: t.categories,
  durationHours: t.durationHours,
  durationLabel: t.durationLabel,
  priceEur: t.priceEur,
  childPriceEur: t.childPriceEur,
  rating: t.rating,
  reviewCount: t.reviewCount,
  badge: t.badge,
  primaryImage: t.primaryImage,
  shortDescription: t.shortDescription,
  highlights: t.highlights.slice(0, 3),
  pickupInfo: t.pickupInfo
}));
var CONCIERGE_SYSTEM_PROMPT = `
You are "Captain Farouk", the warm, professional, and knowledgeable AI Concierge for KemetSpirit, based in Hurghada, Egypt.

Your mission:
1. Have a genuine, friendly, conversational dialogue with travelers planning their Red Sea vacation.
2. Understand their specific desires: destination (Hurghada, El Gouna, Makadi Bay, Sahl Hasheesh, Marsa Alam, Safaga), group composition (solo, couple, family with kids, seniors), preferred vibe (relaxing island beach vs adrenaline desert quad vs colorful coral reef snorkeling vs certified scuba diving vs cultural day trips like Luxor/Cairo), budget, and schedule.
3. Recommend 1 to 3 specific excursions from our verified catalog below. Explain WHY each recommendation fits their exact preferences.
4. When recommending a tour from our catalog, use the exact tour title and mention its starting price in Euros (\u20AC).
5. Always provide practical local tips: morning water clarity, complimentary hotel pickup from resort lobbies, free 24-hour cancellation, and payment options (online or cash on pickup).
6. Support any language the user writes in (English, German, Russian, French, Arabic, Italian, Polish, Dutch, etc.).
7. Keep responses concise, upbeat, and structured with bullet points. Avoid overwhelming walls of text.
8. Guide and assist users with booking: explain that they can directly click the "Book" button on any excursion card in the chat to start reservation instantly. Remind them that visitors can book as guests with zero account registration, enjoy Pay at Pickup mode (cash or card upon hotel lobby pickup), and receive free cancellation up to 24 hours prior.

OUR TOUR CATALOG:
${JSON.stringify(TOUR_CATALOG_SUMMARY, null, 2)}
`;

// src/server/bookingNotificationWorker.ts
var QUEUE_POLL_INTERVAL_MS = 15e3;
var MAX_DELIVERY_ATTEMPTS = 5;
function normalizeSenderEmail(value) {
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  const mailbox = trimmed.match(/<\s*([^<>]+)\s*>/);
  return (mailbox ? mailbox[1] : trimmed).trim();
}
function isValidEmail(value) {
  const normalized = normalizeSenderEmail(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) && normalized.length <= 254;
}
function renderTemplate(source, values) {
  return source.replace(
    /\{\{([a-zA-Z0-9_]+)\}\}/g,
    (match, key) => Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match
  );
}
function normalizeRelation(value) {
  return Array.isArray(value) ? value[0] ?? null : value;
}
function retryDelaySeconds(readCount) {
  return Math.min(1800, 30 * 2 ** Math.max(0, readCount - 1));
}
async function updateEvent(client, eventId, values) {
  const { error } = await client.from("automation_events").update(values).eq("id", eventId);
  if (error) throw error;
}
async function acknowledge(client, messageId) {
  const { error } = await client.rpc("delete_booking_notification_message", {
    p_msg_id: messageId
  });
  if (error) throw error;
}
async function handleFailure(client, message, eventId, error) {
  const reason = error instanceof Error ? error.message : "Unknown notification delivery failure";
  const { data: logRow } = await client.from("communication_messages").select("id").eq("automation_event_id", eventId).eq("channel", "Email").maybeSingle();
  if (logRow?.id) {
    const { error: logError } = await client.from("communication_messages").update({ status: "failed", failure_reason: reason }).eq("id", logRow.id);
    if (logError) throw logError;
  }
  await updateEvent(client, eventId, { error_message: reason });
  if (message.read_ct >= MAX_DELIVERY_ATTEMPTS) {
    const { error: archiveError } = await client.rpc("archive_booking_notification_message", {
      p_msg_id: message.msg_id
    });
    if (archiveError) throw archiveError;
    return;
  }
  const { error: retryError } = await client.rpc("retry_booking_notification_message", {
    p_msg_id: message.msg_id,
    p_delay_seconds: retryDelaySeconds(message.read_ct)
  });
  if (retryError) throw retryError;
}
async function processMessage(client, message, apiKey, fromEmail, fromName) {
  const eventId = message.message?.event_id;
  if (!eventId) {
    await acknowledge(client, message.msg_id);
    return;
  }
  const { data: event, error: eventError } = await client.from("automation_events").select("id,event_name,payload,processed").eq("id", eventId).maybeSingle();
  if (eventError) throw eventError;
  if (!event || event.processed) {
    await acknowledge(client, message.msg_id);
    return;
  }
  if (event.event_name !== "booking.created") {
    await updateEvent(client, eventId, {
      processed: true,
      processed_at: (/* @__PURE__ */ new Date()).toISOString(),
      actions_triggered: ["unsupported_event_skipped"],
      error_message: null
    });
    await acknowledge(client, message.msg_id);
    return;
  }
  const bookingId = String(event.payload?.booking_id || "");
  if (!bookingId) {
    throw new Error("Booking notification event is missing booking_id.");
  }
  const { data: booking, error: bookingError } = await client.from("bookings").select("id,booking_reference,booking_date,total,currency,status,payment_status,customer_id,customers(first_name,last_name,email),tours(title,departure_time)").eq("id", bookingId).maybeSingle();
  if (bookingError) throw bookingError;
  if (!booking) throw new Error("The booking referenced by the notification event was not found.");
  const row = booking;
  const customer = normalizeRelation(row.customers);
  const tour = normalizeRelation(row.tours);
  const recipient = String(customer?.email || "").trim().toLowerCase();
  if (!isValidEmail(recipient)) {
    await updateEvent(client, eventId, {
      processed: true,
      processed_at: (/* @__PURE__ */ new Date()).toISOString(),
      actions_triggered: ["booking_received_email_skipped_missing_email"],
      error_message: "Customer has no valid email address; no email was sent."
    });
    await acknowledge(client, message.msg_id);
    return;
  }
  const { data: template, error: templateError } = await client.from("communication_templates").select("subject,body_text,is_active").eq("template_key", "booking_received").maybeSingle();
  if (templateError) throw templateError;
  if (template && template.is_active === false) {
    await updateEvent(client, eventId, {
      processed: true,
      processed_at: (/* @__PURE__ */ new Date()).toISOString(),
      actions_triggered: ["booking_received_template_disabled"],
      error_message: null
    });
    await acknowledge(client, message.msg_id);
    return;
  }
  const customerName = [customer?.first_name, customer?.last_name].filter(Boolean).join(" ").trim() || "Customer";
  const amount = Number(row.total || 0).toFixed(2);
  const currency = String(row.currency || "EUR").toUpperCase();
  const variables = {
    customer_name: customerName,
    booking_reference: String(row.booking_reference || ""),
    tour_name: String(tour?.title || "your selected tour"),
    tour_date: String(row.booking_date || "").slice(0, 10),
    booking_status: String(row.status || "pending").replace(/_/g, " "),
    currency,
    amount
  };
  const subject = renderTemplate(
    String(template?.subject || "We received your booking request {{booking_reference}}"),
    variables
  );
  const content = renderTemplate(
    String(template?.body_text || "Hello {{customer_name}}, we received your booking request {{booking_reference}} for {{tour_name}} on {{tour_date}}. Our team will review it and send further details."),
    variables
  );
  let logRow = null;
  const { data: existingLog, error: existingLogError } = await client.from("communication_messages").select("id,status").eq("automation_event_id", eventId).eq("channel", "Email").maybeSingle();
  if (existingLogError) throw existingLogError;
  if (existingLog?.status === "sent") {
    await updateEvent(client, eventId, {
      processed: true,
      processed_at: (/* @__PURE__ */ new Date()).toISOString(),
      actions_triggered: ["booking_received_email"],
      error_message: null
    });
    await acknowledge(client, message.msg_id);
    return;
  }
  if (existingLog?.id) {
    const { error } = await client.from("communication_messages").update({
      status: "queued",
      recipient_address: recipient,
      customer_name: customerName,
      subject,
      content,
      provider_name: "Resend",
      failure_reason: null
    }).eq("id", existingLog.id);
    if (error) throw error;
    logRow = { id: existingLog.id, status: "queued" };
  } else {
    const { data: inserted, error } = await client.from("communication_messages").insert({
      automation_event_id: eventId,
      channel: "Email",
      customer_id: row.customer_id,
      customer_name: customerName,
      recipient_address: recipient,
      booking_id: row.id,
      booking_reference: row.booking_reference,
      template_key: "booking_received",
      subject,
      content,
      status: "queued",
      provider_name: "Resend",
      staff_name: "Booking Notification Worker"
    }).select("id,status").single();
    if (error) throw error;
    logRow = inserted;
  }
  const idempotencyKey = `kemetspirit-booking-${eventId}-email`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [recipient],
      reply_to: process.env.RESEND_REPLY_TO?.trim() || "reservation@kemetspirit.com",
      bcc: [process.env.BOOKING_NOTIFICATION_EMAIL?.trim() || "reservation@kemetspirit.com"],
      subject,
      text: content,
      html: renderBrandedEmailHtml({ heading: subject, preheader: subject, bodyText: content }),
      tags: [{ name: "communication_id", value: String(logRow.id) }]
    }),
    signal: AbortSignal.timeout(15e3)
  });
  const providerBody = await response.json().catch(() => ({}));
  if (!response.ok || typeof providerBody?.id !== "string") {
    const detail = typeof providerBody?.message === "string" ? providerBody.message : `Resend rejected the request (HTTP ${response.status}).`;
    throw new Error(detail);
  }
  const sentAt = (/* @__PURE__ */ new Date()).toISOString();
  const { error: updateError } = await client.from("communication_messages").update({
    provider_name: "Resend",
    provider_message_id: providerBody.id,
    sent_at: sentAt,
    failure_reason: null
  }).eq("id", logRow.id);
  if (updateError) throw updateError;
  const { error: statusError } = await client.from("communication_messages").update({ status: "sent" }).eq("id", logRow.id).eq("status", "queued");
  if (statusError) throw statusError;
  await updateEvent(client, eventId, {
    processed: true,
    processed_at: sentAt,
    actions_triggered: ["booking_received_email"],
    error_message: null
  });
  await acknowledge(client, message.msg_id);
}
function startBookingNotificationWorker(client) {
  if (process.env.BOOKING_NOTIFICATION_WORKER_ENABLED?.trim().toLowerCase() !== "true") {
    console.info("[Booking Notification Worker] Not started: BOOKING_NOTIFICATION_WORKER_ENABLED is not true.");
    return () => void 0;
  }
  const apiKey = process.env.RESEND_API_KEY?.trim() || "";
  const fromEmail = normalizeSenderEmail(process.env.RESEND_FROM_EMAIL || "");
  const fromName = process.env.RESEND_FROM_NAME?.trim() || "KemetSpirit";
  if (!apiKey || !isValidEmail(fromEmail)) {
    console.warn("[Booking Notification Worker] Not started: email configuration is incomplete.", {
      missingApiKey: !apiKey,
      invalidFromEmail: !isValidEmail(fromEmail)
    });
    return () => void 0;
  }
  let running = false;
  const poll = async () => {
    if (running) return;
    running = true;
    try {
      const { data, error } = await client.rpc("read_booking_notification_queue", { p_qty: 5 });
      if (error) throw error;
      for (const item of data || []) {
        const eventId = item.message?.event_id;
        try {
          await processMessage(client, item, apiKey, fromEmail, fromName);
        } catch (error2) {
          console.error("[Booking Notification Worker] Delivery attempt failed:", {
            eventId,
            attempt: item.read_ct,
            error: error2 instanceof Error ? error2.message : "Unknown error"
          });
          if (eventId) {
            await handleFailure(client, item, eventId, error2);
          } else {
            await acknowledge(client, item.msg_id);
          }
        }
      }
    } catch (error) {
      console.error("[Booking Notification Worker] Queue poll failed:", error);
    } finally {
      running = false;
    }
  };
  const timer = setInterval(() => void poll(), QUEUE_POLL_INTERVAL_MS);
  timer.unref();
  void poll();
  console.log("[Booking Notification Worker] Started; polling durable Supabase queue.");
  return () => clearInterval(timer);
}

// src/data/staticPages.ts
var INITIAL_STATIC_PAGES = [
  {
    id: "about",
    title: "About KemetSpirit",
    slug: "about",
    heroHeadline: "Explore Egypt\u2019s Red Sea Coast with KemetSpirit",
    heroSubtitle: "Discover the excursions and experiences currently listed on KemetSpirit. Each tour page provides its own description and booking information.",
    lastUpdated: "2026-11-11",
    seoIndexable: true,
    sections: [
      {
        title: "Explore the available experiences",
        content: "Browse the published excursion catalogue to compare destinations, activities and trip details across Egypt\u2019s Red Sea coast."
      },
      {
        title: "Review each tour before booking",
        content: "Tour pages provide the information available for each experience, including its description, price, duration, inclusions and pickup arrangements where applicable."
      }
    ]
  },
  {
    id: "contact",
    title: "Contact KemetSpirit",
    slug: "contact",
    heroHeadline: "Contact KemetSpirit",
    heroSubtitle: "Speak with our Hurghada support team about published excursions, pickup information and reservations.",
    lastUpdated: "2026-11-12",
    seoIndexable: true,
    sections: [
      {
        title: "Phone support",
        content: "+20 151 5212741"
      },
      {
        title: "Hurghada office",
        content: "Hurghada New Marina, Berth B-14, Red Sea, Egypt."
      },
      {
        title: "Before you book",
        content: "Check the selected excursion page for its current price, availability, pickup arrangements and booking conditions."
      }
    ]
  },
  {
    id: "why-us",
    title: "Why Choose KemetSpirit",
    slug: "why-us",
    heroHeadline: "Plan Your Red Sea Experience",
    heroSubtitle: "Use the published tour information to compare available experiences and choose the trip that suits your plans.",
    lastUpdated: "2026-11-11",
    seoIndexable: false,
    sections: [
      {
        title: "Tour information in one place",
        content: "Review each excursion\u2019s description, price, duration, itinerary and included items before you make a reservation."
      },
      {
        title: "Check the details that matter",
        content: "Pickup options, age requirements, availability and cancellation conditions can differ by excursion. Check the relevant tour page and booking details before confirming."
      }
    ]
  },
  {
    id: "marine-safety",
    title: "Marine Safety & Departure Information",
    slug: "marine-safety",
    heroHeadline: "Safety and Departure Information",
    heroSubtitle: "Marine excursions can be affected by weather, sea conditions and operational restrictions. Review the information provided for your selected trip.",
    lastUpdated: "2026-11-11",
    seoIndexable: false,
    sections: [
      {
        title: "Before departure",
        content: "Read the selected excursion\u2019s departure instructions, passenger requirements and equipment information. Follow the instructions provided by the crew and activity staff during the experience."
      },
      {
        title: "Weather and operational changes",
        content: "Marine activities may be changed, delayed or cancelled when conditions do not permit a safe departure. Check the booking terms supplied for your specific excursion for the applicable arrangements."
      }
    ]
  },
  {
    id: "booking-conditions",
    title: "Booking Terms & Conditions",
    slug: "booking-conditions",
    heroHeadline: "Booking Information",
    heroSubtitle: "Review the details and conditions that apply to your selected excursion before completing a reservation.",
    lastUpdated: "2026-11-11",
    seoIndexable: false,
    sections: [
      {
        title: "Reservations and confirmation",
        content: "Check the selected date, number of guests, price, pickup information and other booking details before submitting your reservation. Keep the confirmation information provided after booking."
      },
      {
        title: "Pickup and departure",
        content: "Pickup availability, meeting points, supplements and departure times may vary by excursion and location. Review the details shown for your selected trip before confirming."
      },
      {
        title: "Changes and cancellations",
        content: "Cancellation periods, refund arrangements and rescheduling conditions are specific to the booking terms shown for the selected excursion. Review those terms before completing your reservation."
      }
    ]
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    slug: "privacy",
    heroHeadline: "Your Privacy Matters",
    heroSubtitle: "How KemetSpirit collects, uses, protects and shares information when you browse, contact us or make a reservation.",
    lastUpdated: "2026-11-13",
    seoIndexable: true,
    seoTitle: "Privacy Policy | KemetSpirit",
    seoDescription: "Read how KemetSpirit handles booking, contact, account and website information, including consent-based approximate location, device language data, service providers and privacy rights.",
    sections: [
      { title: "1. Who we are and how to contact us", content: "This website is operated under the name KemetSpirit from Hurghada, Red Sea, Egypt. Our contact location is Hurghada New Marina, Berth B-14, Red Sea, Egypt. For privacy questions or requests, contact us through https://kemetspirit.com/contact or call +20 151 5212741. Please include enough information for us to locate your request, but do not send passwords or full payment-card details. This notice describes the website and booking services; it is not a substitute for advice on the laws that apply to a particular traveller or transaction." },
      { title: "2. Information we may collect", content: "Depending on how you use the website, we may process: contact and identity details such as name, email address, telephone number and country; reservation details such as selected excursion, date, party size, ages, selected tour language, booking reference, pickup or meeting-point details and special requests; account information needed to register, sign in and manage a profile; messages and support requests you send us; newsletter subscription details and subscription status; and technical information such as connection/network details (including IP address where needed for security and abuse prevention), browser and device information, preferred browser languages and locale, timezone, screen/viewport categories, pages requested, timestamps, security events and consent preferences. If you enable optional analytics, we also send your connection IP transiently to ipwho.is to estimate your country, region and city; this is an approximate estimate, not GPS location, and may be inaccurate. We do not store the raw IP address in visitor analytics records. Do not provide sensitive personal information unless it is genuinely needed for a request and you choose to share it." },
      { title: "3. Why we use information", content: "We use information to respond to enquiries; check availability and prepare, administer and communicate reservations; provide booking confirmations, vouchers, service updates and customer support; coordinate the relevant excursion, transfer or activity with the supplier responsible for delivering it; manage accounts and protect sign-in and booking services; maintain records, prevent fraud and misuse, resolve disputes and meet legal obligations; and, where you have chosen to receive them, send newsletters or promotional communications. We rely as applicable on steps requested before a contract, performance of a booking, legitimate interests such as service security and customer support, legal obligations, and consent where required (including optional analytics or marketing technologies)." },
      { title: "4. Who may receive information", content: "We share only information reasonably needed for the relevant purpose. This can include the excursion operator, boat or activity provider, transfer or pickup provider and other suppliers involved in fulfilling your reservation; our website hosting, database, authentication, storage and email-delivery providers (including Hostinger, Supabase and Resend where used); analytics or tag-management providers only in accordance with your cookie choices and applicable settings; ipwho.is, only when you have enabled analytics, to return an approximate country/region/city estimate from your connection IP (the IP is sent transiently for lookup and is not retained in our visitor analytics database); and public authorities, regulators, courts or professional advisers where disclosure is required or reasonably necessary to protect rights, safety or the service. Suppliers may process information under their own privacy notices when they provide their own service." },
      { title: "5. International processing", content: "Some technology and operational suppliers may process or store information in countries outside Egypt, including countries where their infrastructure or support teams operate. Where applicable law requires safeguards for an international transfer, we will use an appropriate transfer mechanism or other legally recognised protection. Contact us if you need more information about a particular service provider or transfer." },
      { title: "6. Retention and security", content: "We keep information for as long as reasonably necessary for the purposes described above, including to complete a booking, provide support, maintain accounting and operational records, address complaints and meet legal requirements. Retention periods vary by record type and legal obligation. We use access controls and technical and organisational measures intended to protect information, but no website or electronic transmission can be guaranteed completely secure. Please use a unique password and do not share your account credentials." },
      { title: "7. Your choices and privacy rights", content: "Depending on the law that applies to you, you may be entitled to request access to, correction or deletion of personal information, object to or restrict certain processing, withdraw consent, or receive a copy of information you provided. You can unsubscribe from marketing messages using the unsubscribe mechanism where provided; service and booking messages may still be sent when necessary. You can change optional cookie choices using Cookie Settings in the website footer. To make a privacy request, contact us using the details in section 1. We may need to verify your identity and may retain information where the law permits or requires it." },
      { title: "8. Children and third-party websites", content: "The website is intended for people arranging travel and reservations. A parent or responsible adult should provide booking details for children where required and should not create an account for a child without appropriate authority. Our website may link to third-party websites or messaging services. We do not control their content or privacy practices; review their notices before using them." },
      { title: "9. Changes to this notice", content: "We may update this policy when our services, technology or legal requirements change. The date above shows when this version was last updated. Material changes will be reflected on this page." }
    ]
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    slug: "terms",
    heroHeadline: "Website & Booking Terms",
    heroSubtitle: "Please read these terms before using the website or submitting an excursion reservation.",
    lastUpdated: "2026-11-12",
    seoIndexable: true,
    seoTitle: "Terms & Conditions | KemetSpirit",
    seoDescription: "Review the website use, excursion reservations, prices, supplier responsibilities, safety, changes and governing terms for KemetSpirit.",
    sections: [
      { title: "1. About these terms", content: "These terms apply to your use of kemetspirit.com and to reservation requests submitted through it. The website is operated under the name KemetSpirit from Hurghada, Egypt. Individual excursions may be delivered by independent boat, transport, activity or destination suppliers. The specific supplier and service details shown for a trip form part of the information you should review before booking." },
      { title: "2. Website information and availability", content: "We take reasonable care to keep tour descriptions, images, schedules, prices, inclusions, pickup details and availability information useful and current. Details can change because of supplier operations, weather, seasonal schedules or availability. A listing is not a guarantee that a departure will operate until your reservation is confirmed. If an important detail appears incorrect, contact us before relying on it." },
      { title: "3. Reservations and confirmation", content: "When you submit a booking form, you are asking us to arrange the selected excursion using the details you provide. A request is not a confirmed reservation until the website or our team issues a booking confirmation or voucher. You are responsible for checking the date, excursion, guest numbers and ages, tour language, pickup information, contact details, price and any special conditions. Keep your booking reference and confirmation." },
      { title: "4. Prices, currency and payment", content: "The price and currency shown during the booking process for the selected excursion are the relevant quoted amounts, subject to any clearly disclosed supplements or changes confirmed before the booking is accepted. Currency conversion displays are indicative and your bank or payment provider may apply its own rate or fees. Payment arrangements can vary by excursion and will be shown during booking or in your confirmation. Never send card numbers, security codes or passwords through ordinary email, chat or booking notes." },
      { title: "5. Tour language, participants and pickup", content: "Tour-guide languages, minimum booking notice, age limits, pickup zones, meeting points and transfer supplements vary by excursion and date. A language option is a request for the selected tour; it is subject to the availability stated for that departure. Provide accurate participant and pickup details and contact us promptly if they change. Arrive at the confirmed meeting point on time and follow the supplier\u2019s instructions." },
      { title: "6. Safety and conduct", content: "You must follow reasonable safety instructions from the crew, guide, driver and activity staff, comply with local laws and respect other participants and the environment. Tell the relevant operator in advance about any condition or mobility requirement that may affect safe participation. The operator may refuse or stop participation where a person\u2019s conduct or condition creates a safety risk, subject to applicable law and the circumstances." },
      { title: "7. Changes, weather and supplier operations", content: "Excursions may be delayed, rerouted, substituted or cancelled because of weather, sea state, port or authority restrictions, safety concerns, supplier availability or events beyond reasonable control. We or the relevant supplier will communicate material changes when practicable. Where the operator cancels a departure, the available rescheduling or refund arrangement will be explained for that booking. See the Cancellation & Refund Policy for more detail." },
      { title: "8. Cancellation and refunds", content: "Cancellation deadlines and refund eligibility are not identical for every excursion. The cancellation terms shown on the selected tour page, at checkout and in your confirmation apply to that reservation and take precedence over general examples on the website. See https://kemetspirit.com/cancellation-policy before booking." },
      { title: "9. Liability and mandatory rights", content: "Nothing in these terms excludes or limits liability where doing so would be unlawful, including rights or remedies that cannot be waived under applicable consumer-protection law. To the extent permitted by law, responsibility for the actual operation and on-the-day delivery of an excursion rests with the supplier providing that service. We remain responsible for our own obligations as required by applicable law." },
      { title: "10. Website use, intellectual property and security", content: "You may use the website for lawful personal travel planning and reservations. Do not misuse the site, interfere with its security, attempt unauthorised access, submit false information, scrape or copy content at scale, or upload malicious material. Website text, branding, design and media are protected by applicable intellectual-property laws unless otherwise stated." },
      { title: "11. Governing law and contact", content: "These terms are intended to be interpreted under the laws of Egypt, without removing any mandatory consumer protections that apply to you under the law of your country of residence. Any dispute will be handled by a competent forum as required by applicable law. Contact us through https://kemetspirit.com/contact or +20 151 5212741. If a provision is unenforceable, the remaining provisions continue to apply to the extent permitted by law." }
    ]
  },
  {
    id: "cancellation-policy",
    title: "Cancellation & Refund Policy",
    slug: "cancellation-policy",
    heroHeadline: "Cancellation & Refunds",
    heroSubtitle: "Cancellation and refund terms depend on the excursion and are confirmed in your booking details.",
    lastUpdated: "2026-11-12",
    seoIndexable: true,
    seoTitle: "Cancellation & Refund Policy | KemetSpirit",
    seoDescription: "Understand how to request a cancellation, how tour-specific deadlines apply, and what happens when weather or operational restrictions prevent a departure.",
    sections: [
      { title: "1. The policy shown for your excursion applies", content: "Different excursions and suppliers may have different cancellation windows and refund conditions. Before paying or submitting a reservation, read the cancellation information displayed on the selected tour page, during checkout and in the booking confirmation or voucher. Those trip-specific terms govern your reservation where they differ from this general policy." },
      { title: "2. Free cancellation windows", content: "Some excursions may offer free cancellation up to 24 hours before the scheduled start. This is not a universal promise for every tour: the 24-hour window applies only when it is expressly shown for your selected excursion or confirmed in your voucher. If your booking has a different deadline, fee or non-refundable condition, that specific condition applies, subject to mandatory legal rights." },
      { title: "3. How to request a cancellation or change", content: "Contact our team as soon as possible using https://kemetspirit.com/contact or call +20 151 5212741. Provide your booking reference, the lead traveller\u2019s name and the excursion date. A cancellation is not complete merely because you sent a message; wait for our acknowledgement or written confirmation. Requests received close to departure may not be processed before the supplier\u2019s deadline, so do not delay." },
      { title: "4. Late arrival and no-shows", content: "If you miss the pickup or departure, arrive after the confirmed meeting time, or do not attend, the supplier may treat the reservation as a no-show and the booking may be non-refundable under its stated terms. Contact us immediately if an unexpected delay occurs. Any exception is subject to the supplier\u2019s decision and applicable law." },
      { title: "5. Weather, safety and operator cancellations", content: "Boat trips and outdoor activities can be affected by weather, sea conditions, port closures, authority instructions or safety decisions. If the responsible operator cancels or cannot safely provide the booked departure, we will contact affected guests about the available options for that reservation. Depending on the circumstances and the applicable booking terms, this may include an alternative date, a suitable replacement or a refund. We will not ask guests to proceed with an activity that the responsible operator considers unsafe." },
      { title: "6. Refund method and timing", content: "Where a refund is due, the amount and method will be confirmed with you. Refunds are normally arranged through the original payment route where that route supports a refund; where payment was arranged directly with a supplier or collected at pickup, the team will explain the applicable process. Banks and payment providers may take additional time to post a refund. We do not promise a fixed processing time where it depends on a third party." },
      { title: "7. Changes made by the traveller", content: "Date, guest-count, pickup or tour-language changes are subject to availability and supplier approval. A requested change may be treated as a cancellation and new reservation if the supplier cannot amend the original booking. Any price difference or fee will be explained before the change is confirmed." },
      { title: "8. Questions and disputes", content: "Keep your booking confirmation and any cancellation correspondence. If you believe a cancellation or refund was handled incorrectly, contact us with the booking reference and a clear description of the issue so we can review it with the relevant supplier. Nothing in this policy limits consumer rights that cannot legally be excluded." }
    ]
  },
  {
    id: "cookie-policy",
    title: "Cookie & Website Storage Policy",
    slug: "cookie-policy",
    heroHeadline: "Cookies & Your Choices",
    heroSubtitle: "Learn how this website uses browser storage and optional analytics technologies, and how to change your choices.",
    lastUpdated: "2026-11-13",
    seoIndexable: true,
    seoTitle: "Cookie Policy | KemetSpirit",
    seoDescription: "Learn about essential website storage, Google Tag Manager analytics and marketing consent, and how to change cookie preferences on KemetSpirit.",
    sections: [
      { title: "1. Cookies and similar technologies", content: "Cookies are small files stored by a website in your browser. Websites may also use local storage, session storage, pixels and scripts for similar purposes. This site uses browser storage for essential functions and preferences. The website also has Google Tag Manager installed; optional analytics or advertising tags are held back until you make an optional-consent choice through the cookie banner. When you enable analytics, the server also sends your connection IP transiently to ipwho.is to estimate country, region and city; the IP itself is not stored in our visitor analytics records." },
      { title: "2. Essential storage", content: "Essential storage supports the website you ask to use. Depending on the features you use, this may include remembering your language and light/dark theme, retaining a booking draft or temporary interface preferences, maintaining authentication/session state through our authentication provider, and saving your cookie-consent choice. These functions are not used to create advertising profiles. If you block all browser storage, some account, booking or preference features may not work correctly." },
      { title: "3. Analytics and marketing choices", content: "Analytics technologies help us understand site usage and improve navigation and booking journeys. Marketing technologies, if enabled in our tag-management configuration, may measure or personalise promotional activity. These optional categories are disabled by default. Google Tag Manager is loaded only after you choose analytics or marketing consent; the consent signals sent to Google distinguish analytics from advertising choices. Individual tags in the tag manager must also be configured to respect the corresponding consent category." },
      { title: "4. Third-party services", content: "When enabled or used, third-party services may set or access their own technologies under their own policies. These can include Google services delivered through our tag manager, Supabase for authentication and application data, ipwho.is for approximate IP-derived location when analytics consent is enabled, and external services or content you choose to open, such as WhatsApp. Loading external images, fonts or links may also cause your browser to contact the relevant provider. Review the provider\u2019s own privacy and cookie information for details." },
      { title: "5. Managing and withdrawing consent", content: "On your first visit, choose Accept all, Reject optional or Customise in the cookie banner. Necessary storage is always active because the website cannot provide core functions without it. You can reopen the controls at any time using Cookie Settings in the website footer and change analytics or marketing choices. A change updates the consent signals used by the site for future tag activity. If a third party has already stored a cookie, you may also need to clear it through your browser settings." },
      { title: "6. Browser controls and retention", content: "Most browsers let you view, block or delete cookies and clear site data. The cookie-choice record is stored in this browser so the site can remember your decision; clearing site data or using another browser/device may cause the banner to appear again. Preference and application storage may remain until you clear it or the application replaces it. Third-party cookie lifetimes are controlled by the relevant provider." },
      { title: "7. Updates and contact", content: "We may update this policy when website features or providers change. For questions about cookies or your choices, contact us through https://kemetspirit.com/contact or call +20 151 5212741. See our Privacy Policy for broader information about personal data." }
    ]
  }
];

// src/lib/supabaseProjectGuard.ts
var EXPECTED_KEMETSPIRIT_SUPABASE_PROJECT_REF = "uvtbtpxtrrmaublrztgv";
function isExpectedKemetSpiritSupabaseUrl(url, allowNonProductionProject = false) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (allowNonProductionProject) {
      if (parsed.protocol === "https:" && parsed.hostname.endsWith(".supabase.co")) {
        return true;
      }
      return parsed.protocol === "http:" && (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1");
    }
    return parsed.protocol === "https:" && parsed.hostname === `${EXPECTED_KEMETSPIRIT_SUPABASE_PROJECT_REF}.supabase.co`;
  } catch {
    return false;
  }
}

// server.ts
dotenv.config();
var app = express();
app.set("trust proxy", 1);
var PORT = process.env.PORT || 3e3;
var SERVER_START_TIME = Date.now();
function parseJwtPayload(token) {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function isSupabaseSecretKey(key) {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (trimmed.startsWith("sb_secret_")) return true;
  const payload = parseJwtPayload(trimmed);
  return payload?.role === "service_role";
}
function isSupabasePublishableKey(key) {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (trimmed.startsWith("sb_publishable_")) return true;
  const payload = parseJwtPayload(trimmed);
  return payload?.role === "anon";
}
function validateSupabaseUrl(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith("https://") && !trimmed.startsWith("http://")) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return trimmed;
    }
  } catch {
    return null;
  }
  return null;
}
function resolveServerSupabaseConfig() {
  let resolvedUrl = null;
  let configError;
  const rawServerUrl = process.env.SUPABASE_URL;
  const rawViteUrl = process.env.VITE_SUPABASE_URL;
  if (rawServerUrl !== void 0 && rawServerUrl !== "") {
    const validated = validateSupabaseUrl(rawServerUrl);
    if (validated) {
      resolvedUrl = validated;
    } else {
      configError = "Server environment variable SUPABASE_URL is defined but is not a valid HTTP/HTTPS URL.";
    }
  } else if (rawViteUrl !== void 0 && rawViteUrl !== "") {
    const validated = validateSupabaseUrl(rawViteUrl);
    if (validated) {
      resolvedUrl = validated;
    } else {
      configError = "Environment variable VITE_SUPABASE_URL is defined but is not a valid HTTP/HTTPS URL.";
    }
  }
  if (resolvedUrl) {
    const allowNonProductionProject = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
    if (!isExpectedKemetSpiritSupabaseUrl(resolvedUrl, allowNonProductionProject)) {
      configError = `CONFIGURATION ERROR: This production KemetSpirit server must use Supabase project ${EXPECTED_KEMETSPIRIT_SUPABASE_PROJECT_REF}.`;
      resolvedUrl = null;
    }
  }
  const rawSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const rawAnon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  let resolvedKey = null;
  let keyType = "none";
  if (rawSecret) {
    if (isSupabaseSecretKey(rawSecret)) {
      resolvedKey = rawSecret.trim();
      keyType = "service_role";
    } else {
      const isAnon = isSupabasePublishableKey(rawSecret);
      configError = isAnon ? "CONFIGURATION ERROR: An anonymous/publishable key was supplied to SUPABASE_SERVICE_ROLE_KEY. Service-role operations require a genuine secret key (sb_secret_... or service_role JWT)." : "CONFIGURATION ERROR: SUPABASE_SERVICE_ROLE_KEY is not a valid Supabase secret key.";
    }
  } else if (rawAnon) {
    if (isSupabasePublishableKey(rawAnon)) {
      resolvedKey = rawAnon.trim();
      keyType = "anon";
    } else {
      configError = "CONFIGURATION ERROR: Configured Supabase anon key is invalid.";
    }
  }
  return {
    url: resolvedUrl,
    key: resolvedKey,
    keyType,
    configError
  };
}
var supabaseConfig = resolveServerSupabaseConfig();
if (supabaseConfig.configError) {
  console.error(`[Supabase Config Error] ${supabaseConfig.configError}`);
}
var SUPABASE_URL = supabaseConfig.url;
var SUPABASE_KEY = supabaseConfig.key;
var SUPABASE_KEY_TYPE = supabaseConfig.keyType;
var rawUserSupabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
var SUPABASE_USER_KEY = isSupabasePublishableKey(rawUserSupabaseKey) ? rawUserSupabaseKey.trim() : null;
var serverSupabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    serverSupabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  } catch (initErr) {
    console.error("Server Supabase client initialization failure:", initErr);
    serverSupabase = null;
  }
}
var publicSupabase = null;
if (SUPABASE_URL && SUPABASE_USER_KEY) {
  try {
    publicSupabase = createClient(SUPABASE_URL, SUPABASE_USER_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  } catch (initErr) {
    console.error("[Public SEO Supabase] Client initialization failure:", initErr);
    publicSupabase = null;
  }
}
var rateLimitBuckets = /* @__PURE__ */ new Map();
var RATE_LIMIT_BUCKET_CAPACITY = 5e4;
function rateLimit(maxRequests = 60, windowMs = 6e4) {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${req.baseUrl || req.path}:${ip}`;
    const now = Date.now();
    let bucket = rateLimitBuckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 1, resetAt: now + windowMs };
      rateLimitBuckets.set(key, bucket);
    } else if (bucket.count >= maxRequests) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1e3));
      res.setHeader("Retry-After", String(retryAfter));
      res.setHeader("RateLimit-Limit", String(maxRequests));
      res.setHeader("RateLimit-Remaining", "0");
      res.setHeader("RateLimit-Reset", String(Math.max(0, Math.ceil((bucket.resetAt - now) / 1e3))));
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please wait before trying again.",
        retryAfter
      });
    } else {
      bucket.count += 1;
      rateLimitBuckets.delete(key);
      rateLimitBuckets.set(key, bucket);
    }
    res.setHeader("RateLimit-Limit", String(maxRequests));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, maxRequests - bucket.count)));
    res.setHeader("RateLimit-Reset", String(Math.max(0, Math.ceil((bucket.resetAt - now) / 1e3))));
    if (rateLimitBuckets.size > RATE_LIMIT_BUCKET_CAPACITY) {
      for (const [entryKey, entry] of rateLimitBuckets) {
        if (now >= entry.resetAt || rateLimitBuckets.size > RATE_LIMIT_BUCKET_CAPACITY) {
          rateLimitBuckets.delete(entryKey);
        }
      }
    }
    next();
  };
}
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitBuckets) {
    if (now >= value.resetAt) rateLimitBuckets.delete(key);
  }
}, 6e4).unref();
async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !/^Bearer\s+/i.test(authHeader)) {
    return next();
  }
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return res.status(401).json({ success: false, error: "A valid access token is required." });
  }
  if (!serverSupabase) {
    return res.status(503).json({ success: false, error: "Authentication verification is temporarily unavailable." });
  }
  try {
    const { data: { user }, error } = await serverSupabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ success: false, error: "The access token is invalid or expired. Please sign in again." });
    }
    let role = "customer";
    if (SUPABASE_URL && SUPABASE_USER_KEY) {
      const userScopedSupabase = createClient(SUPABASE_URL, SUPABASE_USER_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false }
      });
      const { data: profile, error: profileError } = await userScopedSupabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profileError) {
        console.warn("Server auth profile-role lookup failed; applying customer permissions:", profileError.message);
      } else if (profile?.role && ["customer", "staff", "manager", "admin", "super_admin"].includes(profile.role)) {
        role = profile.role;
      }
      const { data: accessContext, error: accessError } = await userScopedSupabase.rpc("get_my_access_context");
      if (!accessError && Array.isArray(accessContext?.roles)) {
        const assignedRoles = accessContext.roles.filter((item) => typeof item === "string");
        if (assignedRoles.includes("super_admin")) role = "super_admin";
        else if (assignedRoles.includes("admin")) role = "admin";
      }
    }
    req.user = { id: user.id, email: user.email, role };
    return next();
  } catch (err) {
    console.error("Server auth verification unavailable:", err);
    return res.status(503).json({ success: false, error: "Authentication verification is temporarily unavailable." });
  }
}
app.use("/api/webhooks/resend", express.raw({ type: "application/json", limit: "1mb" }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use((req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";
  const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()).filter((value) => {
    if (!value || value === "*") return false;
    try {
      const parsed = new URL(value);
      return parsed.origin === value && (parsed.protocol === "https:" || !isProduction && parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname));
    } catch {
      return false;
    }
  });
  const allowedOrigins = /* @__PURE__ */ new Set([
    "https://kemetspirit.com",
    "https://www.kemetspirit.com",
    ...!isProduction ? ["http://localhost:3000", "http://localhost:5173"] : [],
    ...configuredOrigins
  ]);
  const origin = req.headers.origin;
  res.vary("Origin");
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Idempotency-Key");
    res.setHeader("Access-Control-Max-Age", "600");
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  if (isProduction) res.setHeader("Strict-Transport-Security", "max-age=31536000");
  if (req.path.startsWith("/api/")) res.setHeader("Cache-Control", "no-store");
  next();
});
app.use("/api", rateLimit(300, 6e4));
app.use("/api", authenticateToken);
app.use(["/api/admin", "/api/communications"], (req, res, next) => {
  if (!req.user || !["admin", "super_admin"].includes(req.user.role)) return next();
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  const claims = token ? parseJwtPayload(token) : null;
  if (claims?.aal !== "aal2") {
    return res.status(403).json({
      success: false,
      error: "A verified authenticator code is required before administrator access.",
      code: "ADMIN_AAL2_REQUIRED"
    });
  }
  return next();
});
app.use("/api", (req, res, next) => {
  const startedAt = Date.now();
  const requestId = randomUUID();
  res.setHeader("X-Request-ID", requestId);
  res.on("finish", () => {
    if (!serverSupabase) return;
    const routePath = req.route?.path ? `${req.baseUrl}${String(req.route.path)}` : req.path;
    if (routePath.startsWith("/api/admin/technical") || routePath === "/api/health") return;
    const durationMs = Math.max(0, Date.now() - startedAt);
    const severity = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warning" : "info";
    void Promise.resolve(serverSupabase.from("technical_events").insert({
      severity,
      event_type: "api_request",
      source: "http",
      message: `API request completed with status ${res.statusCode}`,
      request_method: req.method,
      request_path: routePath,
      status_code: res.statusCode,
      duration_ms: durationMs,
      actor_user_id: req.user?.id || null,
      metadata: { request_id: requestId }
    })).catch(() => void 0);
  });
  next();
});
var ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function normalizeSenderEmail2(value) {
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  const mailbox = trimmed.match(/<\s*([^<>]+)\s*>/);
  return (mailbox ? mailbox[1] : trimmed).trim();
}
function isValidEmail2(email) {
  const normalized = normalizeSenderEmail2(email);
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(normalized) && normalized.length <= 254;
}
app.post("/api/chat", rateLimit(10, 6e4), async (req, res) => {
  const { messages, prompt } = req.body || {};
  const cleanPrompt = typeof prompt === "string" ? prompt.trim() : "";
  const cleanMessages = Array.isArray(messages) ? messages : [];
  if (prompt !== void 0 && typeof prompt !== "string" || messages !== void 0 && (!Array.isArray(messages) || messages.length > 20) || cleanPrompt.length > 2e3 || cleanMessages.some(
    (message) => !message || !["user", "assistant"].includes(message.role) || typeof message.content !== "string" || message.content.length > 2e3
  )) {
    return res.status(400).json({ error: "Invalid chat payload. Limit each message to 2,000 characters and each conversation to 20 messages." });
  }
  if (!cleanPrompt && cleanMessages.length === 0) {
    return res.status(400).json({ error: "Prompt is required" });
  }
  if (ai) {
    try {
      const conversationHistory = cleanMessages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      if (cleanPrompt && (!cleanMessages.length || cleanMessages[cleanMessages.length - 1]?.content !== cleanPrompt)) {
        conversationHistory.push({
          role: "user",
          parts: [{ text: cleanPrompt }]
        });
      }
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: conversationHistory,
        config: {
          systemInstruction: CONCIERGE_SYSTEM_PROMPT,
          temperature: 0.7
        }
      });
      const responseText = response.text || "";
      const lower = responseText.toLowerCase();
      const matchedTours = TOUR_CATALOG_SUMMARY.filter((tour) => {
        return lower.includes(tour.title.toLowerCase()) || lower.includes(tour.slug) || lower.includes("orange bay") && tour.slug.includes("orange-bay") || lower.includes("dolphin house") && tour.slug.includes("dolphin") || lower.includes("paradise island") && tour.slug.includes("paradise") || lower.includes("quad") && tour.slug.includes("safari") || lower.includes("scuba diving") && tour.slug.includes("diving") || lower.includes("speedboat") && tour.slug.includes("speedboat") || lower.includes("luxor") && tour.slug.includes("luxor") || lower.includes("cairo") && tour.slug.includes("cairo") || lower.includes("submarine") && tour.slug.includes("submarine") || lower.includes("sharm el naga") && tour.slug.includes("sharm-el-naga");
      }).slice(0, 3);
      return res.json({
        text: responseText,
        recommendedTours: matchedTours
      });
    } catch (err) {
      console.warn("Gemini generateContent error in /api/chat:", err);
    }
  }
  return res.status(503).json({
    error: "Gemini service temporarily unavailable",
    fallback: true
  });
});
app.get("/api/health", rateLimit(120, 6e4), (_req, res) => {
  res.json({
    status: "ok",
    version: "2.4.0",
    uptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1e3),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
function requireCommunicationsStaff(req, res) {
  if (!req.user) {
    res.status(401).json({ success: false, error: "Sign in with an authorized staff account to send communications." });
    return false;
  }
  if (!["staff", "manager", "admin", "super_admin"].includes(req.user.role)) {
    res.status(403).json({ success: false, error: "Administrative or staff permissions are required." });
    return false;
  }
  return true;
}
app.get("/api/communications/status", rateLimit(60, 6e4), (req, res) => {
  if (!requireCommunicationsStaff(req, res)) return;
  const normalizedFromEmail = normalizeSenderEmail2(process.env.RESEND_FROM_EMAIL || "");
  const apiKeyPresent = Boolean(process.env.RESEND_API_KEY?.trim());
  const fromEmailValid = isValidEmail2(normalizedFromEmail);
  const emailConfigured = apiKeyPresent && fromEmailValid;
  const whatsappConfigured = Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() && /^v\d+\.\d+$/.test(process.env.WHATSAPP_GRAPH_API_VERSION || "")
  );
  res.json({
    email: {
      configured: emailConfigured,
      provider: "Resend",
      fromEmail: normalizedFromEmail,
      configurationIssue: !apiKeyPresent ? "missing_api_key" : !fromEmailValid ? "invalid_from_email" : null,
      fromName: process.env.RESEND_FROM_NAME?.trim() || "KemetSpirit",
      webhookConfigured: (process.env.RESEND_WEBHOOK_SECRET?.trim() || "").startsWith("whsec_"),
      bookingWorkerEnabled: process.env.BOOKING_NOTIFICATION_WORKER_ENABLED?.trim().toLowerCase() === "true"
    },
    whatsapp: {
      configured: whatsappConfigured,
      provider: "Meta Cloud API",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || "",
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim() || "",
      fromNumber: process.env.WHATSAPP_FROM_NUMBER?.trim() || ""
    }
  });
});
app.post("/api/communications/email", rateLimit(20, 6e4), async (req, res) => {
  if (!requireCommunicationsStaff(req, res)) return;
  const to = typeof req.body?.to === "string" ? req.body.to.trim().toLowerCase() : "";
  const subject = typeof req.body?.subject === "string" ? req.body.subject.trim() : "";
  const textBody = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!isValidEmail2(to) || !subject || subject.length > 200 || !textBody || textBody.length > 2e4) {
    return res.status(400).json({ success: false, error: "A valid recipient, subject (max 200 characters), and message (max 20,000 characters) are required." });
  }
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") {
    return res.status(503).json({ success: false, error: "Secure server-side database logging is unavailable. Email was not sent." });
  }
  const apiKey = process.env.RESEND_API_KEY?.trim() || "";
  const fromEmail = normalizeSenderEmail2(process.env.RESEND_FROM_EMAIL || "");
  const fromName = (process.env.RESEND_FROM_NAME || "KemetSpirit").replace(/[<>\r\n]/g, "").trim() || "KemetSpirit";
  const senderReady = Boolean(apiKey && isValidEmail2(fromEmail));
  const idempotencyKey = typeof req.headers["idempotency-key"] === "string" && /^[a-zA-Z0-9._:-]{8,128}$/.test(req.headers["idempotency-key"]) ? req.headers["idempotency-key"] : randomUUID();
  const { data: audit, error: auditError } = await serverSupabase.from("communication_messages").insert({
    channel: "Email",
    recipient_address: to,
    subject,
    content: textBody,
    status: senderReady ? "queued" : "failed",
    provider_name: senderReady ? "Resend" : "Not configured",
    failure_reason: senderReady ? null : "Resend is not configured: a valid RESEND_API_KEY and RESEND_FROM_EMAIL are required.",
    staff_name: req.user?.email || "Staff Dispatcher"
  }).select("id").single();
  if (auditError || !audit?.id) {
    console.error("Communication email audit insert failed:", auditError?.message || "Missing audit ID");
    return res.status(503).json({ success: false, error: "Email was not sent because its audit record could not be stored." });
  }
  const markFailed = async (reason) => {
    const { error } = await serverSupabase.from("communication_messages").update({ status: "failed", provider_name: senderReady ? "Resend" : "Not configured", failure_reason: reason }).eq("id", audit.id);
    if (error) console.error("Communication email failure audit update failed:", error.message);
  };
  if (!senderReady) {
    return res.status(503).json({ success: false, error: "Server-side email delivery is not configured. Set RESEND_API_KEY and a valid RESEND_FROM_EMAIL in Hostinger environment variables.", messageLogId: audit.id });
  }
  try {
    const providerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [to],
        ...isValidEmail2(process.env.RESEND_REPLY_TO?.trim() || "") ? { reply_to: process.env.RESEND_REPLY_TO.trim() } : {},
        subject,
        text: textBody,
        html: renderBrandedEmailHtml({ heading: subject, preheader: subject, bodyText: textBody }),
        tags: [{ name: "communication_id", value: String(audit.id) }]
      }),
      signal: AbortSignal.timeout(15e3)
    });
    const providerBody = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok || typeof providerBody?.id !== "string") {
      const providerError = typeof providerBody?.message === "string" ? providerBody.message : `Email provider rejected the request (HTTP ${providerResponse.status}).`;
      await markFailed(providerError);
      return res.status(502).json({ success: false, error: providerError, messageLogId: audit.id });
    }
    const sentAt = (/* @__PURE__ */ new Date()).toISOString();
    const { error: updateError } = await serverSupabase.from("communication_messages").update({ provider_name: "Resend", provider_message_id: providerBody.id, sent_at: sentAt, failure_reason: null }).eq("id", audit.id);
    if (updateError) console.error("Communication email provider details could not be saved:", updateError.message);
    const { error: statusError } = await serverSupabase.from("communication_messages").update({ status: "sent" }).eq("id", audit.id).eq("status", "queued");
    if (statusError) console.error("Communication email sent status could not be saved:", statusError.message);
    return res.status(200).json({
      success: true,
      providerName: "Resend",
      providerMessageId: providerBody.id,
      messageLogId: audit.id,
      status: "sent"
    });
  } catch (error) {
    const message = error?.name === "TimeoutError" ? "Email provider request timed out. Delivery could not be confirmed." : "Email provider request failed. Please retry after checking the server logs.";
    await markFailed(message);
    return res.status(502).json({ success: false, error: message, messageLogId: audit.id });
  }
});
app.post("/api/webhooks/resend", rateLimit(300, 6e4), async (req, res) => {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim() || "";
  if (!webhookSecret.startsWith("whsec_")) {
    return res.status(503).json({ success: false, error: "Resend webhook verification is not configured." });
  }
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
  const svixId = req.header("svix-id") || "";
  const svixTimestamp = req.header("svix-timestamp") || "";
  const svixSignature = req.header("svix-signature") || "";
  const timestamp = Number(svixTimestamp);
  if (!rawBody || !svixId || !svixTimestamp || !svixSignature || !Number.isFinite(timestamp) || Math.abs(Date.now() / 1e3 - timestamp) > 300) {
    return res.status(400).json({ success: false, error: "Invalid webhook headers or timestamp." });
  }
  try {
    const secretBytes = Buffer.from(webhookSecret.slice("whsec_".length), "base64");
    const expected = createHmac("sha256", secretBytes).update(`${svixId}.${svixTimestamp}.${rawBody}`).digest();
    const signatureMatches = svixSignature.split(" ").some((entry) => {
      const [version, encoded] = entry.split(",");
      if (version !== "v1" || !encoded) return false;
      const supplied = Buffer.from(encoded, "base64");
      return supplied.length === expected.length && timingSafeEqual(supplied, expected);
    });
    if (!signatureMatches) {
      return res.status(401).json({ success: false, error: "Webhook signature verification failed." });
    }
  } catch {
    return res.status(401).json({ success: false, error: "Webhook signature verification failed." });
  }
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") {
    return res.status(503).json({ success: false, error: "Secure webhook database storage is unavailable." });
  }
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ success: false, error: "Invalid webhook JSON." });
  }
  const eventId = svixId.slice(0, 200);
  const eventType = typeof event?.type === "string" ? event.type.slice(0, 100) : "";
  const data = event?.data && typeof event.data === "object" ? event.data : {};
  if (!eventType || typeof data.email_id !== "string") {
    return res.status(400).json({ success: false, error: "Unsupported or incomplete Resend email event." });
  }
  const recipients = Array.isArray(data.to) ? data.to.filter((value) => typeof value === "string" && isValidEmail2(value)).slice(0, 50) : [];
  const recipient = recipients[0]?.toLowerCase() || null;
  const occurredAt = typeof event.created_at === "string" && !Number.isNaN(Date.parse(event.created_at)) ? new Date(event.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
  const { error: eventInsertError } = await serverSupabase.from("email_provider_events").insert({
    event_id: eventId,
    event_type: eventType,
    provider_message_id: String(data.email_id).slice(0, 200),
    recipient_address: recipient,
    occurred_at: occurredAt,
    payload: event
  });
  if (eventInsertError && eventInsertError.code !== "23505") {
    console.error("Resend webhook event persistence failed:", eventInsertError.message);
    return res.status(503).json({ success: false, error: "Webhook event could not be stored." });
  }
  const statusByEvent = {
    "email.sent": "sent",
    "email.delivered": "delivered",
    "email.opened": "opened",
    "email.clicked": "opened",
    "email.bounced": "failed",
    "email.complained": "failed",
    "email.failed": "failed",
    "email.delivery_delayed": "sent",
    "email.suppressed": "failed"
  };
  const nextStatus = statusByEvent[eventType];
  if (nextStatus) {
    const failureReason = ["email.bounced", "email.complained", "email.failed", "email.suppressed"].includes(eventType) ? `Resend event: ${eventType}` : null;
    const update = { status: nextStatus, provider_message_id: data.email_id, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
    if (nextStatus === "delivered") update.delivered_at = occurredAt;
    if (nextStatus === "opened") update.opened_at = occurredAt;
    if (failureReason) update.failure_reason = failureReason;
    const tagList = Array.isArray(data.tags) ? data.tags : [];
    const taggedCommunicationId = tagList.find((tag) => tag?.name === "communication_id")?.value || (data.tags && typeof data.tags === "object" && !Array.isArray(data.tags) ? data.tags.communication_id : null);
    const communicationId = typeof taggedCommunicationId === "string" && /^[0-9a-f-]{36}$/i.test(taggedCommunicationId) ? taggedCommunicationId : null;
    let messageUpdateQuery = serverSupabase.from("communication_messages").update(update);
    messageUpdateQuery = communicationId ? messageUpdateQuery.eq("id", communicationId) : messageUpdateQuery.eq("provider_message_id", data.email_id);
    const { data: updatedMessages, error: messageUpdateError } = await messageUpdateQuery.select("id");
    if (messageUpdateError) {
      console.error("Resend webhook message status update failed:", messageUpdateError.message);
      return res.status(503).json({ success: false, error: "Webhook was stored but the message status could not be updated." });
    }
    if (!updatedMessages?.length) {
      const fallbackRecipient = recipient || "unknown-recipient";
      const { error: externalLogError } = await serverSupabase.from("communication_messages").insert({
        channel: "Email",
        customer_name: fallbackRecipient,
        recipient_address: fallbackRecipient,
        subject: typeof data.subject === "string" ? data.subject.slice(0, 500) : "External email",
        content: `Email event ${eventType} received from Resend. Full provider payload is stored in email_provider_events.`,
        status: nextStatus,
        provider_name: "Resend",
        provider_message_id: String(data.email_id).slice(0, 200),
        failure_reason: failureReason,
        sent_at: eventType === "email.sent" ? occurredAt : null,
        delivered_at: eventType === "email.delivered" ? occurredAt : null,
        opened_at: ["email.opened", "email.clicked"].includes(eventType) ? occurredAt : null,
        staff_name: "External Email Provider"
      });
      if (externalLogError && externalLogError.code !== "23505") {
        console.error("External Resend email audit insert failed:", externalLogError.message);
        return res.status(503).json({ success: false, error: "Webhook was stored but its admin email record could not be created." });
      }
    }
  }
  return res.status(200).json({ success: true, eventId, eventType });
});
app.post("/api/communications/whatsapp", rateLimit(20, 6e4), async (req, res) => {
  if (!requireCommunicationsStaff(req, res)) return;
  const phone = typeof req.body?.phone === "string" ? req.body.phone.replace(/[^0-9]/g, "") : "";
  const message = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (phone.length < 8 || phone.length > 15 || !message || message.length > 4096) {
    return res.status(400).json({ success: false, error: "A valid international phone number and message (max 4,096 characters) are required." });
  }
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const graphVersion = process.env.WHATSAPP_GRAPH_API_VERSION?.trim();
  if (!accessToken || !phoneNumberId || !/^\d{5,30}$/.test(phoneNumberId) || !/^v\d+\.\d+$/.test(graphVersion || "")) {
    return res.status(503).json({ success: false, error: "Server-side WhatsApp delivery is not configured. Set WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_GRAPH_API_VERSION in Hostinger environment variables." });
  }
  try {
    const providerResponse = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: { preview_url: false, body: message }
      }),
      signal: AbortSignal.timeout(15e3)
    });
    const providerBody = await providerResponse.json().catch(() => ({}));
    const providerMessageId = providerBody?.messages?.[0]?.id;
    if (!providerResponse.ok || typeof providerMessageId !== "string") {
      const providerError = typeof providerBody?.error?.message === "string" ? providerBody.error.message : `WhatsApp provider rejected the request (HTTP ${providerResponse.status}).`;
      return res.status(502).json({ success: false, error: providerError });
    }
    return res.status(200).json({
      success: true,
      providerName: "Meta Cloud API",
      providerMessageId,
      status: "sent"
    });
  } catch (error) {
    const message2 = error?.name === "TimeoutError" ? "WhatsApp provider request timed out. No delivery confirmation was received." : "WhatsApp provider request failed. Please retry after checking the server logs.";
    return res.status(502).json({ success: false, error: message2 });
  }
});
app.get("/api/config", rateLimit(120, 6e4), (_req, res) => {
  res.json({
    brandName: "KemetSpirit",
    hotline: "+20 151 5212741",
    whatsappUrl: "https://wa.me/201515212741",
    operatingHours: "06:00 - 22:00 EET (Daily)",
    currencyDefault: "EUR",
    supportedCurrencies: ["EUR", "USD", "GBP", "EGP"],
    supportedLanguages: ["en", "de", "ru", "fr", "ar", "it", "pl", "nl"],
    depositRequired: false,
    cancellationFreeNoticeHours: 24
  });
});
app.get("/api/tours", rateLimit(120, 6e4), async (req, res) => {
  const { destination, category, search, limit } = req.query;
  const maxItems = Math.min(Math.max(1, parseInt(limit, 10) || 50), 100);
  if (!serverSupabase) {
    const tours = TOUR_CATALOG_SUMMARY.map((t) => ({
      id: t.slug,
      slug: t.slug,
      title: t.title,
      shortDescription: `${t.title} excursion in Red Sea`,
      destination: t.destination,
      category: t.category,
      categories: [t.category],
      priceEur: t.priceEur,
      durationLabel: t.durationLabel,
      durationHours: 7,
      rating: 4.8,
      reviewCount: 45,
      primaryImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      badge: "Popular"
    }));
    return res.json({
      success: true,
      count: tours.length,
      total: tours.length,
      tours
    });
  }
  try {
    let query = serverSupabase.from("tours").select(`
        id,
        title,
        slug,
        short_description,
        description,
        destination_id,
        duration,
        duration_type,
        duration_hours,
        tour_type,
        status,
        featured,
        price,
        child_price,
        infant_price,
        private_price,
        currency,
        max_guests,
        minimum_booking_notice_hours,
        pickup_available,
        pickup_info,
        cancellation_policy,
        departure_time,
        available_days,
        languages,
        difficulty,
        age_restrictions,
        badge,
        rating,
        review_count,
        sort_order,
        created_at,
        destinations (id, name, slug),
        tour_categories (categories (id, name, slug)),
        tour_images (id, image_url, is_primary, sort_order)
      `).eq("status", "published").order("sort_order", { ascending: true }).limit(maxItems);
    if (destination && typeof destination === "string") {
      const cleanDest = destination.trim().replace(/[%_()]/g, "");
      if (cleanDest) {
        query = query.ilike("destination_id", `%${cleanDest}%`);
      }
    }
    if (search && typeof search === "string") {
      const cleanSearch = search.trim().replace(/[%_()]/g, "");
      if (cleanSearch) {
        query = query.or(`title.ilike.%${cleanSearch}%,short_description.ilike.%${cleanSearch}%`);
      }
    }
    const { data, error } = await query;
    if (error) {
      console.error("Supabase /api/tours query error:", error.message);
      return res.status(500).json({
        success: false,
        error: "Database query failed when loading tour catalogue.",
        tours: [],
        count: 0,
        total: 0
      });
    }
    const tours = (data || []).map((t) => {
      const primaryImg = t.tour_images?.find((img) => img.is_primary) || t.tour_images?.[0];
      const cats = t.tour_categories?.map((tc) => tc.categories?.name).filter(Boolean) || [];
      return {
        id: t.id,
        slug: t.slug,
        title: t.title,
        shortDescription: t.short_description || "",
        destination: t.destinations?.name || "Hurghada",
        category: cats[0] || "Excursion",
        categories: cats,
        priceEur: Number(t.price) || 0,
        childPriceEur: t.child_price != null ? Number(t.child_price) : void 0,
        durationLabel: t.duration || `${t.duration_hours || 7} Hours`,
        durationHours: t.duration_hours || 7,
        rating: Number(t.rating) || 5,
        reviewCount: Number(t.review_count) || 0,
        primaryImage: primaryImg?.image_url || "",
        badge: t.badge || (t.featured ? "Popular" : void 0)
      };
    });
    return res.json({
      success: true,
      count: tours.length,
      total: tours.length,
      tours
    });
  } catch (err) {
    console.error("Unhandled exception in /api/tours:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error processing tour catalogue request.",
      tours: [],
      count: 0,
      total: 0
    });
  }
});
app.post("/api/bookings/create", rateLimit(10, 6e4), async (req, res) => {
  const {
    tourSlug,
    date,
    guests,
    customer,
    pickupLocationId,
    hotelName,
    roomNumber,
    extras,
    paymentMethod = "pay_at_pickup",
    specialRequests,
    couponCode
  } = req.body || {};
  if (!serverSupabase || !SUPABASE_URL || !SUPABASE_USER_KEY) {
    return res.status(503).json({
      success: false,
      error: "The reservation service is temporarily unavailable. Please try again later."
    });
  }
  if (typeof tourSlug !== "string" || !tourSlug.trim()) {
    return res.status(400).json({ success: false, error: "A valid tour is required." });
  }
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ success: false, error: "A valid excursion date (YYYY-MM-DD) is required." });
  }
  const parsedDate = /* @__PURE__ */ new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
    return res.status(400).json({ success: false, error: "The excursion date is invalid." });
  }
  const todayUtc = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  if (date < todayUtc) {
    return res.status(400).json({ success: false, error: "Selected excursion date cannot be in the past." });
  }
  if (!customer || typeof customer.firstName !== "string" || !customer.firstName.trim() || typeof customer.lastName !== "string" || !customer.lastName.trim() || typeof customer.email !== "string" || !isValidEmail2(customer.email)) {
    return res.status(400).json({ success: false, error: "Valid customer name and email are required." });
  }
  const adults = guests?.adults;
  const children = guests?.children ?? 0;
  const infants = guests?.infants ?? 0;
  if (!Number.isInteger(adults) || adults < 1 || adults > 100 || !Number.isInteger(children) || children < 0 || children > 100 || !Number.isInteger(infants) || infants < 0 || infants > 50) {
    return res.status(400).json({ success: false, error: "Passenger counts are outside the permitted ranges." });
  }
  if (!["pay_at_pickup", "pay_online"].includes(paymentMethod)) {
    return res.status(400).json({ success: false, error: "Unsupported payment method." });
  }
  if (extras !== void 0 && !Array.isArray(extras)) {
    return res.status(400).json({ success: false, error: "Invalid add-on selection." });
  }
  const idempotencyKey = String(
    req.get("Idempotency-Key") || req.body?.idempotencyKey || ""
  ).trim();
  if (idempotencyKey.length < 16 || idempotencyKey.length > 200) {
    return res.status(400).json({ success: false, error: "Invalid idempotency key." });
  }
  try {
    const authorization = req.get("Authorization");
    const requestClient = createClient(SUPABASE_URL, SUPABASE_USER_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: authorization ? { headers: { Authorization: authorization } } : void 0
    });
    const { data, error } = await requestClient.rpc("create_booking_atomic", {
      p_tour_identifier: tourSlug.trim(),
      p_booking_date: date,
      p_adult_count: adults,
      p_child_count: children,
      p_infant_count: infants,
      p_customer_first_name: customer.firstName.trim(),
      p_customer_last_name: customer.lastName.trim(),
      p_customer_email: customer.email.trim().toLowerCase(),
      p_customer_phone: [customer.countryCode, customer.phoneNumber].filter(Boolean).join(" ").trim(),
      p_customer_country: customer.country || "International",
      p_customer_hotel: hotelName || customer.hotelName || null,
      p_pickup_location_id: pickupLocationId || null,
      p_pickup_room_number: roomNumber || null,
      p_extras: (extras || []).map((item) => ({
        id: item.id || item.extraId || "",
        name: item.name || "",
        quantity: item.quantity ?? 1
      })),
      p_coupon_code: typeof couponCode === "string" && couponCode.trim() ? couponCode.trim() : null,
      p_payment_method: paymentMethod,
      p_special_requests: specialRequests || null,
      p_idempotency_key: idempotencyKey
    });
    if (error) {
      console.error("Atomic booking RPC failed:", error);
      return res.status(500).json({
        success: false,
        error: "We could not complete the reservation. Please try again or contact our booking team."
      });
    }
    const result = data;
    if (!result || result.success !== true || !result.bookingReference) {
      return res.status(400).json({
        success: false,
        error: result?.error || "The reservation could not be validated."
      });
    }
    const total = Number(result.totalEur || 0);
    return res.status(result.isDuplicate ? 200 : 201).json({
      success: true,
      bookingId: result.bookingId,
      bookingReference: result.bookingReference,
      idempotencyKey,
      tour: { slug: tourSlug.trim() },
      date,
      guests: { adults, children, infants, total: adults + children + infants },
      pricing: {
        totalEur: total,
        currency: "EUR",
        formattedTotal: `\u20AC${total.toFixed(2)}`
      },
      paymentMethod,
      status: result.status || "pending",
      paymentStatus: result.paymentStatus || "pending",
      isDuplicate: Boolean(result.isDuplicate)
    });
  } catch (err) {
    console.error("Unhandled exception during atomic booking creation:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error while processing your reservation."
    });
  }
});
app.all(["/api/bookings/lookup", "/api/booking/lookup"], rateLimit(10, 6e4), async (req, res) => {
  const reference = req.body?.reference || req.query?.ref || req.query?.reference;
  const verification = String(
    req.body?.contactVerification || req.body?.verification || req.body?.emailOrPhone || req.query?.verification || req.query?.email || req.query?.phone || ""
  ).trim();
  if (!reference || typeof reference !== "string") {
    return res.status(400).json({ success: false, found: false, error: "Booking reference is required." });
  }
  const cleanRef = reference.trim().toUpperCase();
  if (!/^RST-\d{4}-[A-Z0-9]{4,32}$/.test(cleanRef)) {
    return res.status(400).json({ success: false, found: false, error: "Invalid booking reference format." });
  }
  if (!serverSupabase) {
    return res.status(503).json({ success: false, found: false, error: "The reservation lookup service is temporarily unavailable." });
  }
  const isStaff = Boolean(req.user && ["admin", "super_admin", "manager", "staff"].includes(req.user.role));
  try {
    if (isStaff) {
      const { data, error } = await serverSupabase.from("bookings").select("id, booking_reference, booking_date, status, payment_status, payment_method, subtotal, extras_total, discount, total, currency, special_requests, customers(*), tours(title, slug, primary_image, duration)").eq("booking_reference", cleanRef).maybeSingle();
      if (error) {
        console.error("Staff booking lookup failed:", error.message);
        return res.status(503).json({ success: false, found: false, error: "The reservation lookup service is temporarily unavailable." });
      }
      if (!data) {
        return res.status(404).json({ success: false, found: false, error: "Booking not found or verification failed." });
      }
      return res.json({ success: true, found: true, booking: data });
    }
    if (!verification || verification.length > 254) {
      return res.status(400).json({
        success: false,
        found: false,
        error: "The email address or full phone number used during booking is required."
      });
    }
    const { data: rpcResult, error: rpcError } = await serverSupabase.rpc("lookup_booking_secure", {
      p_reference: cleanRef,
      p_verification: verification
    });
    if (rpcError) {
      console.error("Secure booking lookup RPC failed:", rpcError.message);
      if (rpcError.message?.toLowerCase().includes("too many")) {
        return res.status(429).json({ success: false, found: false, error: "Too many verification attempts. Please wait before trying again." });
      }
      return res.status(503).json({ success: false, found: false, error: "The reservation lookup service is temporarily unavailable." });
    }
    const rawBooking = rpcResult && typeof rpcResult === "object" ? rpcResult : null;
    if (!rawBooking?.found || !rawBooking.bookingReference) {
      return res.status(404).json({ success: false, found: false, error: "Booking not found or verification failed." });
    }
    return res.json({
      success: true,
      found: true,
      booking: {
        bookingReference: rawBooking.bookingReference,
        status: rawBooking.status,
        paymentStatus: rawBooking.paymentStatus,
        paymentMethod: rawBooking.paymentMethod,
        bookingDate: rawBooking.bookingDate,
        createdAt: rawBooking.createdAt,
        guests: rawBooking.guests,
        tour: rawBooking.tour,
        pickup: rawBooking.pickup,
        pricing: rawBooking.pricing,
        customer: {
          firstName: rawBooking.customer?.firstName,
          lastName: rawBooking.customer?.lastName,
          emailMasked: rawBooking.customer?.emailMasked,
          phoneMasked: rawBooking.customer?.phoneMasked,
          country: rawBooking.customer?.country
        },
        extras: rawBooking.extras,
        specialRequests: rawBooking.specialRequests
      }
    });
  } catch (error) {
    console.error("Secure booking lookup exception:", error);
    return res.status(503).json({ success: false, found: false, error: "The reservation lookup service is temporarily unavailable." });
  }
});
app.all("/api/availability/check", rateLimit(60, 6e4), async (req, res) => {
  const tourSlug = String(req.body?.tourSlug || req.query?.tourSlug || req.query?.slug || "").trim();
  const date = String(req.body?.date || req.query?.date || "").trim();
  const adults = Number.parseInt(String(req.body?.adults || req.query?.adults || "1"), 10);
  const children = Number.parseInt(String(req.body?.children || req.query?.children || "0"), 10);
  if (!tourSlug || tourSlug.length > 180 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      success: false,
      error: "A valid tourSlug and date (YYYY-MM-DD) are required"
    });
  }
  const checkDate = /* @__PURE__ */ new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(checkDate.getTime()) || checkDate.toISOString().slice(0, 10) !== date) {
    return res.status(400).json({ success: false, error: "The requested date is invalid." });
  }
  if (!Number.isSafeInteger(adults) || adults < 1 || !Number.isSafeInteger(children) || children < 0 || adults + children > 100) {
    return res.status(400).json({ success: false, error: "Guest counts are invalid." });
  }
  const formatLocalDate = (value) => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  const now = /* @__PURE__ */ new Date();
  const minimumNoticeHours = 12;
  const isPast = date < formatLocalDate(now);
  const noticeCutoff = new Date(now.getTime() + minimumNoticeHours * 60 * 60 * 1e3);
  const noticeViolated = date < formatLocalDate(noticeCutoff);
  if (isPast || noticeViolated) {
    return res.json({
      success: true,
      tourSlug,
      date,
      isDateAvailable: false,
      isPastDate: isPast,
      isNoticeCutoffViolated: noticeViolated,
      minimumNoticeHours,
      remainingSeatsTotal: 0,
      slots: [],
      notes: isPast ? "Cannot book past dates." : "The selected date does not meet the minimum booking notice."
    });
  }
  if (!publicSupabase) {
    return res.status(503).json({
      success: false,
      error: "Live departure availability is temporarily unavailable."
    });
  }
  try {
    const { data, error } = await publicSupabase.rpc("get_tour_availability_schedule", {
      p_tour_identifier: tourSlug,
      p_start_date: date,
      p_end_date: date
    });
    if (error) {
      console.error("Authoritative availability lookup failed:", error);
      return res.status(503).json({
        success: false,
        error: "Live departure availability is temporarily unavailable."
      });
    }
    const slot = Array.isArray(data) ? data[0] : null;
    if (!slot) {
      return res.status(404).json({ success: false, error: "Tour or scheduled date was not found." });
    }
    const capacity = Math.max(0, Number(slot.max_capacity) || 0);
    const booked = Math.max(0, Number(slot.booked_count) || 0);
    const remaining = Math.max(0, Number(slot.remaining_capacity) || 0);
    const hasScheduledDeparture = slot.status === "available" && slot.is_available === true && capacity > booked && remaining > 0;
    const partyFits = remaining >= adults + children;
    const isDateAvailable = hasScheduledDeparture && partyFits;
    return res.json({
      success: true,
      tourSlug,
      date,
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][checkDate.getUTCDay()],
      isDateAvailable,
      isPastDate: false,
      isNoticeCutoffViolated: false,
      minimumNoticeHours,
      remainingSeatsTotal: remaining,
      maxGuestsPerGroup: capacity,
      slots: isDateAvailable ? [{
        slotId: `departure-${date}`,
        time: slot.departure_time || "Scheduled departure",
        label: "Scheduled departure",
        availableSeats: remaining,
        maxCapacity: capacity,
        status: "available",
        privateAvailable: false
      }] : [],
      notes: isDateAvailable ? void 0 : hasScheduledDeparture ? "The requested party size exceeds the remaining capacity." : "No confirmed departure is scheduled for this date."
    });
  } catch (error) {
    console.error("Authoritative availability endpoint failed:", error);
    return res.status(503).json({
      success: false,
      error: "Live departure availability is temporarily unavailable."
    });
  }
});
async function sendInquiryNotificationEmail(params) {
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") {
    console.error("Inquiry email was not sent: secure communications audit database is unavailable.");
    return;
  }
  const apiKey = process.env.RESEND_API_KEY?.trim() || "";
  const fromEmail = normalizeSenderEmail2(process.env.RESEND_FROM_EMAIL || "");
  const fromName = (process.env.RESEND_FROM_NAME || "KemetSpirit").replace(/[<>\r\n]/g, "").trim() || "KemetSpirit";
  const configured = Boolean(apiKey && isValidEmail2(fromEmail));
  const { data: log, error: logError } = await serverSupabase.from("communication_messages").insert({
    channel: "Email",
    customer_name: params.customerName,
    recipient_address: params.recipientEmail,
    template_key: params.templateKey,
    subject: params.subject,
    content: params.content,
    status: configured ? "queued" : "failed",
    provider_name: configured ? "Resend" : "Not configured",
    failure_reason: configured ? null : "Resend is not configured: a valid RESEND_API_KEY and RESEND_FROM_EMAIL are required.",
    staff_name: "Inquiry Notification Service"
  }).select("id").single();
  if (logError || !log?.id) {
    console.error("Inquiry email audit insert failed:", logError?.message || "Missing audit ID");
    return;
  }
  if (!configured) return;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `kemetspirit-inquiry-${log.id}` },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [params.recipientEmail],
        ...params.replyTo && isValidEmail2(params.replyTo) ? { reply_to: params.replyTo } : {},
        subject: params.subject,
        text: params.content,
        html: renderBrandedEmailHtml({ heading: params.subject, preheader: params.subject, bodyText: params.content }),
        tags: [{ name: "communication_id", value: String(log.id) }]
      }),
      signal: AbortSignal.timeout(15e3)
    });
    const providerBody = await response.json().catch(() => ({}));
    if (!response.ok || typeof providerBody?.id !== "string") {
      throw new Error(typeof providerBody?.message === "string" ? providerBody.message : `Resend rejected the request (HTTP ${response.status}).`);
    }
    const sentAt = (/* @__PURE__ */ new Date()).toISOString();
    const { error } = await serverSupabase.from("communication_messages").update({ provider_name: "Resend", provider_message_id: providerBody.id, sent_at: sentAt, failure_reason: null }).eq("id", log.id);
    if (error) console.error("Inquiry email provider details update failed:", error.message);
    const { error: statusError } = await serverSupabase.from("communication_messages").update({ status: "sent" }).eq("id", log.id).eq("status", "queued");
    if (statusError) console.error("Inquiry email sent status update failed:", statusError.message);
  } catch (error) {
    const reason = error?.message || "Resend inquiry email failed.";
    const { error: updateError } = await serverSupabase.from("communication_messages").update({ status: "failed", provider_name: "Resend", failure_reason: reason }).eq("id", log.id);
    if (updateError) console.error("Inquiry email failure status update failed:", updateError.message);
    console.error("Inquiry email dispatch failed:", reason);
  }
}
app.post(["/api/inquiries", "/api/inquiries/submit", "/api/contact"], rateLimit(5, 10 * 6e4), async (req, res) => {
  const { name, email, phone, inquiryType = "general_question", message, website_url_hp } = req.body;
  if (website_url_hp && String(website_url_hp).trim() !== "") {
    return res.status(200).json({ success: true, status: "received" });
  }
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Name, valid email, and message are required"
    });
  }
  if (!isValidEmail2(email)) {
    return res.status(400).json({
      success: false,
      error: "Please enter a valid email address"
    });
  }
  const cleanName = String(name).trim().slice(0, 100);
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanMessage = String(message).trim().slice(0, 2e3);
  const cleanPhone = phone ? String(phone).slice(0, 30) : null;
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const ticketNumber = `INQ-${currentYear}-${Math.floor(1e3 + Math.random() * 9e3)}`;
  if (serverSupabase) {
    try {
      const { data, error } = await serverSupabase.from("inquiries").insert({
        customer_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        subject: inquiryType === "general_question" ? "General Excursion Question" : String(inquiryType),
        message: cleanMessage,
        status: "new",
        source: "web"
      }).select("id, created_at").single();
      if (!error && data) {
        const inquirySubject = inquiryType === "general_question" ? "General Excursion Question" : String(inquiryType).slice(0, 120);
        const reservationEmail = process.env.BOOKING_NOTIFICATION_EMAIL?.trim() || "reservation@kemetspirit.com";
        await Promise.all([
          sendInquiryNotificationEmail({
            recipientEmail: reservationEmail,
            customerName: cleanName,
            templateKey: "inquiry_staff_notification",
            subject: `New website inquiry: ${inquirySubject}`,
            replyTo: cleanEmail,
            content: [
              "A new inquiry was submitted on KemetSpirit.",
              `Inquiry ID: ${data.id}`,
              `Name: ${cleanName}`,
              `Email: ${cleanEmail}`,
              `Phone: ${cleanPhone || "Not provided"}`,
              `Subject: ${inquirySubject}`,
              "",
              "Message:",
              cleanMessage
            ].join("\n")
          }),
          sendInquiryNotificationEmail({
            recipientEmail: cleanEmail,
            customerName: cleanName,
            templateKey: "inquiry_customer_confirmation",
            subject: "We received your message \u2014 KemetSpirit",
            content: `Hello ${cleanName},

Thank you for contacting KemetSpirit. We have received your inquiry (reference ${data.id}) and our team will respond within 2 hours during Egypt Pier Desk hours.

If your question is urgent, you can contact our reservations team at reservation@kemetspirit.com.

KemetSpirit`
          })
        ]);
        return res.status(201).json({
          success: true,
          inquiryId: data.id,
          ticketNumber,
          status: "received",
          estimatedResponseTime: "Within 2 hours (Egypt Pier Desk hours)",
          receivedAt: data.created_at
        });
      }
      if (error) {
        console.error("Supabase inquiries insert error:", error.message);
      }
    } catch (dbErr) {
      console.warn("Supabase inquiries insert exception:", dbErr);
    }
  }
  return res.status(503).json({
    success: false,
    error: "Inquiry service is currently unconfigured or database is unreachable."
  });
});
function createNewsletterUnsubscribeToken(subscriberId, email) {
  const secret = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "").trim();
  if (!secret) throw new Error("Newsletter unsubscribe signing is not configured.");
  const payload = Buffer.from(`${subscriberId}:${email}`).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}
function verifyNewsletterUnsubscribeToken(token) {
  const secret = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "").trim();
  const [payload, suppliedSignature] = token.split(".");
  if (!secret || !payload || !suppliedSignature) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  let supplied;
  try {
    supplied = Buffer.from(suppliedSignature, "base64url");
  } catch {
    return null;
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator <= 0) return null;
    const subscriberId = decoded.slice(0, separator);
    const email = decoded.slice(separator + 1).toLowerCase();
    if (!/^[0-9a-f-]{36}$/i.test(subscriberId) || !isValidEmail2(email)) return null;
    return { subscriberId, email };
  } catch {
    return null;
  }
}
app.get("/api/newsletter/unsubscribe", rateLimit(30, 6e4), (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const verified = verifyNewsletterUnsubscribeToken(token);
  if (!verified || !serverSupabase || SUPABASE_KEY_TYPE !== "service_role") {
    return res.status(400).type("text").send("This unsubscribe link is invalid or expired. Please contact reservations for assistance.");
  }
  const action = "/api/newsletter/unsubscribe?token=" + encodeURIComponent(token);
  return res.status(200).type("html").send('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Confirm unsubscribe</title><body style="font-family:Arial,sans-serif;max-width:560px;margin:12vh auto;padding:24px;color:#17212b"><h1>Unsubscribe from updates?</h1><p>Confirm below to stop newsletter and promotional emails from KemetSpirit.</p><form method="post" action="' + action + '"><button type="submit" style="background:#0a6c74;color:white;border:0;border-radius:8px;padding:12px 18px;font-weight:bold">Confirm unsubscribe</button></form><p><a href="https://kemetspirit.com/">Return to KemetSpirit</a></p></body></html>');
});
app.post("/api/newsletter/unsubscribe", rateLimit(20, 6e4), async (req, res) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const verified = verifyNewsletterUnsubscribeToken(token);
  if (!verified || !serverSupabase || SUPABASE_KEY_TYPE !== "service_role") {
    return res.status(400).type("text").send("This unsubscribe link is invalid or expired. Please contact reservations for assistance.");
  }
  const { error } = await serverSupabase.from("newsletter_subscriptions").update({ status: "unsubscribed", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", verified.subscriberId).eq("email", verified.email);
  if (error) {
    console.error("Newsletter unsubscribe update failed:", error.message);
    return res.status(503).type("text").send("We could not process your request right now. Please try again later.");
  }
  return res.status(200).type("html").send('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribed</title><body style="font-family:Arial,sans-serif;max-width:560px;margin:12vh auto;padding:24px;color:#17212b"><h1>You have been unsubscribed</h1><p>You will no longer receive newsletter and promotional emails from KemetSpirit.</p><p>If this was a mistake, you can subscribe again from our website.</p><a href="https://kemetspirit.com/">Return to KemetSpirit</a></body></html>');
});
app.post(["/api/newsletter", "/api/newsletter/subscribe"], rateLimit(3, 10 * 6e4), async (req, res) => {
  const { email, preferredLanguage = "en", website_url_hp, consentAccepted } = req.body || {};
  if (website_url_hp && String(website_url_hp).trim() !== "") {
    return res.json({ success: true, subscribed: true, message: "Thank you for subscribing." });
  }
  if (typeof email !== "string" || !isValidEmail2(email.trim())) {
    return res.status(400).json({ success: false, error: "Please provide a valid email address." });
  }
  if (consentAccepted !== true) {
    return res.status(400).json({ success: false, error: "Please confirm that you agree to receive newsletter updates before subscribing." });
  }
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") {
    return res.status(503).json({ success: false, error: "Newsletter database service is not configured. Please try again later." });
  }
  const cleanEmail = email.trim().toLowerCase();
  const source = typeof req.body?.source === "string" ? req.body.source.trim().slice(0, 80) || "website" : "website";
  let subscriber = null;
  let shouldSendWelcome = false;
  try {
    const { data: existing, error: lookupError } = await serverSupabase.from("newsletter_subscriptions").select("id,email,status,created_at,updated_at").eq("email", cleanEmail).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing?.status === "subscribed") {
      return res.json({
        success: true,
        subscribed: true,
        alreadySubscribed: true,
        subscriberId: existing.id,
        createdAt: existing.created_at,
        discountCode: "REDSEA15",
        emailStatus: "not_sent",
        message: "You are already subscribed. Your REDSEA15 voucher is ready."
      });
    }
    if (existing) {
      const { data, error } = await serverSupabase.from("newsletter_subscriptions").update({
        status: "subscribed",
        source,
        discount_code: "REDSEA15",
        metadata: { preferredLanguage: String(preferredLanguage || "en").slice(0, 20), reSubscribedAt: (/* @__PURE__ */ new Date()).toISOString() },
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", existing.id).select("id,created_at,updated_at").single();
      if (error) throw error;
      subscriber = data;
    } else {
      const { data, error } = await serverSupabase.from("newsletter_subscriptions").insert({
        email: cleanEmail,
        source,
        status: "subscribed",
        discount_code: "REDSEA15",
        metadata: { preferredLanguage: String(preferredLanguage || "en").slice(0, 20), consentSource: source, consentedAt: (/* @__PURE__ */ new Date()).toISOString() }
      }).select("id,created_at,updated_at").single();
      if (error) {
        if (error.code === "23505") {
          return res.json({ success: true, subscribed: true, alreadySubscribed: true, discountCode: "REDSEA15", emailStatus: "not_sent", message: "You are already subscribed. Your REDSEA15 voucher is ready." });
        }
        throw error;
      }
      subscriber = data;
    }
    shouldSendWelcome = true;
  } catch (error) {
    console.error("Supabase newsletter persistence failed:", error?.message || error);
    return res.status(503).json({ success: false, error: "We could not save your subscription. Please try again later." });
  }
  if (!subscriber || !shouldSendWelcome) {
    return res.status(500).json({ success: false, error: "Newsletter subscription could not be confirmed." });
  }
  const apiKey = process.env.RESEND_API_KEY?.trim() || "";
  const fromEmail = normalizeSenderEmail2(process.env.RESEND_FROM_EMAIL || "");
  const fromName = (process.env.RESEND_FROM_NAME || "KemetSpirit").replace(/[<>\r\n]/g, "").trim() || "KemetSpirit";
  const unsubscribeToken = createNewsletterUnsubscribeToken(subscriber.id, cleanEmail);
  const unsubscribeUrl = `https://kemetspirit.com/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  const { data: welcomeTemplate, error: welcomeTemplateError } = await serverSupabase.from("communication_templates").select("subject,body_text,is_active").eq("template_key", "newsletter_welcome").maybeSingle();
  if (welcomeTemplateError) {
    console.error("Newsletter welcome template lookup failed:", welcomeTemplateError.message);
  }
  const templateVariables = {
    discount_code: "REDSEA15",
    unsubscribe_url: unsubscribeUrl
  };
  const renderNewsletterTemplate = (value) => value.replace(
    /\{\{([a-zA-Z0-9_]+)\}\}/g,
    (match, key) => Object.prototype.hasOwnProperty.call(templateVariables, key) ? templateVariables[key] : match
  );
  const subject = renderNewsletterTemplate(String(welcomeTemplate?.subject || "Welcome to KemetSpirit \u2014 your 15% voucher"));
  const content = renderNewsletterTemplate(String(welcomeTemplate?.body_text || "Thank you for subscribing to KemetSpirit. Your 15% voucher code is {{discount_code}}. Use it when enquiring about your next excursion.\n\nYou can unsubscribe at any time: {{unsubscribe_url}}."));
  let emailStatus = "failed";
  let providerMessageId = null;
  const providerReady = Boolean(apiKey && isValidEmail2(fromEmail));
  const templateEnabled = welcomeTemplate?.is_active !== false;
  const senderReady = providerReady && templateEnabled;
  const failureReason = !templateEnabled ? "Newsletter welcome template is disabled." : providerReady ? null : "Resend is not configured: a valid RESEND_API_KEY and RESEND_FROM_EMAIL are required in Hostinger.";
  const { data: messageLog, error: logInsertError } = await serverSupabase.from("communication_messages").insert({
    channel: "Email",
    customer_name: cleanEmail,
    recipient_address: cleanEmail,
    template_key: "newsletter_welcome",
    subject,
    content,
    status: senderReady ? "queued" : "failed",
    provider_name: providerReady ? "Resend" : "Not configured",
    failure_reason: failureReason,
    staff_name: "Newsletter Subscription Service"
  }).select("id").single();
  if (logInsertError || !messageLog?.id) {
    console.error("Newsletter email audit record could not be created:", logInsertError?.message || "Missing log ID");
    return res.json({
      success: true,
      subscribed: true,
      subscriberId: subscriber.id,
      createdAt: subscriber.created_at,
      discountCode: "REDSEA15",
      emailStatus: "failed",
      message: "Your subscription was saved, but we could not record the welcome email. Please contact reservations for your voucher."
    });
  }
  if (senderReady) {
    try {
      const providerResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `kemetspirit-newsletter-welcome-${subscriber.id}-${new Date(subscriber.updated_at).getTime()}`
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: [cleanEmail],
          ...isValidEmail2(process.env.RESEND_REPLY_TO?.trim() || "") ? { reply_to: process.env.RESEND_REPLY_TO.trim() } : {},
          subject,
          text: content,
          tags: [{ name: "communication_id", value: String(messageLog.id) }],
          html: renderBrandedEmailHtml({ heading: "Welcome aboard!", preheader: subject, bodyText: content, footerNote: "You received this email because you subscribed to KemetSpirit. Use the unsubscribe link above if you no longer want updates." })
        }),
        signal: AbortSignal.timeout(15e3)
      });
      const providerBody = await providerResponse.json().catch(() => ({}));
      if (!providerResponse.ok || typeof providerBody?.id !== "string") {
        throw new Error(typeof providerBody?.message === "string" ? providerBody.message : `Resend rejected the request (HTTP ${providerResponse.status}).`);
      }
      providerMessageId = providerBody.id;
      emailStatus = "sent";
      const sentAt = (/* @__PURE__ */ new Date()).toISOString();
      const { error: updateError } = await serverSupabase.from("communication_messages").update({ provider_name: "Resend", provider_message_id: providerMessageId, sent_at: sentAt, failure_reason: null }).eq("id", messageLog.id);
      if (updateError) console.error("Newsletter email provider details update failed:", updateError.message);
      const { error: statusError } = await serverSupabase.from("communication_messages").update({ status: "sent" }).eq("id", messageLog.id).eq("status", "queued");
      if (statusError) console.error("Newsletter email audit status update failed:", statusError.message);
    } catch (error) {
      const reason = error?.message || "Resend email delivery failed.";
      const { error: updateError } = await serverSupabase.from("communication_messages").update({ status: "failed", provider_name: "Resend", failure_reason: reason }).eq("id", messageLog.id);
      if (updateError) console.error("Newsletter email failure could not be recorded:", updateError.message);
      console.error("Newsletter welcome email failed:", reason);
    }
  }
  return res.json({
    success: true,
    subscribed: true,
    subscriberId: subscriber.id,
    createdAt: subscriber.created_at,
    discountCode: "REDSEA15",
    emailStatus,
    message: emailStatus === "sent" ? "You are subscribed! Your REDSEA15 voucher has been sent to your email." : "Your subscription is saved, but the welcome email could not be sent yet. Please contact reservations for your voucher."
  });
});
function requireSuperAdminAal2(req, res) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  const claims = token ? parseJwtPayload(token) : null;
  if (!req.user || req.user.role !== "super_admin") {
    res.status(403).json({ success: false, error: "Super Admin access is required." });
    return false;
  }
  if (claims?.aal !== "aal2") {
    res.status(403).json({ success: false, error: "A verified AAL2 multi-factor session is required for account administration." });
    return false;
  }
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") {
    res.status(503).json({ success: false, error: "Secure Auth Admin service is not configured. Configure a server-only Supabase secret/service-role key." });
    return false;
  }
  return true;
}
app.get("/api/admin/technical/overview", rateLimit(30, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") {
    return res.status(503).json({ success: false, error: "Technical diagnostics require the server-side Supabase secret." });
  }
  const since = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
  const dbStartedAt = Date.now();
  try {
    const requestCount = await serverSupabase.from("technical_events").select("id", { count: "exact", head: true }).gte("created_at", since);
    const dbLatencyMs = Date.now() - dbStartedAt;
    if (requestCount.error) throw requestCount.error;
    const [
      errorCount,
      warningCount,
      latencyRows,
      recentRows,
      auditRows,
      bucketResult
    ] = await Promise.all([
      serverSupabase.from("technical_events").select("id", { count: "exact", head: true }).gte("created_at", since).eq("severity", "error"),
      serverSupabase.from("technical_events").select("id", { count: "exact", head: true }).gte("created_at", since).eq("severity", "warning"),
      serverSupabase.from("technical_events").select("duration_ms,status_code").gte("created_at", since).not("duration_ms", "is", null).order("created_at", { ascending: false }).limit(5e3),
      serverSupabase.from("technical_events").select("id,created_at,severity,event_type,source,message,request_method,request_path,status_code,duration_ms,actor_user_id,metadata").order("created_at", { ascending: false }).limit(100),
      serverSupabase.from("audit_logs").select("id,created_at,action,entity_type,entity_id,user_id").order("created_at", { ascending: false }).limit(100),
      serverSupabase.storage.listBuckets()
    ]);
    const queryError = errorCount.error || warningCount.error || latencyRows.error || recentRows.error || auditRows.error;
    if (queryError) throw queryError;
    const durations = (latencyRows.data || []).map((row) => Number(row.duration_ms)).filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
    const totalRequests = requestCount.count || 0;
    const totalErrors = errorCount.count || 0;
    const totalWarnings = warningCount.count || 0;
    const averageLatencyMs = durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : null;
    const p95LatencyMs = durations.length ? durations[Math.min(durations.length - 1, Math.ceil(durations.length * 0.95) - 1)] : null;
    const normalizedFromEmail = normalizeSenderEmail2(process.env.RESEND_FROM_EMAIL || "");
    const emailConfigured = Boolean(process.env.RESEND_API_KEY?.trim() && isValidEmail2(normalizedFromEmail));
    const whatsappConfigured = Boolean(process.env.WHATSAPP_ACCESS_TOKEN?.trim() && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() && /^v\d+\.\d+$/.test(process.env.WHATSAPP_GRAPH_API_VERSION || ""));
    return res.json({
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      runtime: {
        status: "ok",
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "unknown",
        uptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1e3),
        appVersion: process.env.npm_package_version || "unknown"
      },
      services: {
        database: { status: "ok", latencyMs: dbLatencyMs },
        storage: { status: bucketResult.error ? "error" : "ok", bucketCount: bucketResult.error ? null : (bucketResult.data || []).length },
        email: { configured: emailConfigured, webhookConfigured: (process.env.RESEND_WEBHOOK_SECRET || "").startsWith("whsec_") },
        whatsapp: { configured: whatsappConfigured },
        bookingWorker: { enabled: process.env.BOOKING_NOTIFICATION_WORKER_ENABLED?.trim().toLowerCase() === "true" }
      },
      metrics: {
        requests24h: totalRequests,
        errors24h: totalErrors,
        warnings24h: totalWarnings,
        errorRatePct: totalRequests ? Number((totalErrors / totalRequests * 100).toFixed(2)) : 0,
        averageLatencyMs,
        p95LatencyMs,
        latencySampleSize: durations.length
      },
      recentEvents: recentRows.data || [],
      recentAuditEvents: auditRows.data || []
    });
  } catch (error) {
    console.error("[Technical Control Center] Overview query failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(503).json({ success: false, error: "Technical diagnostics are temporarily unavailable. Check the telemetry migration and server database connection." });
  }
});
app.get("/api/admin/technical/audit-logs", rateLimit(60, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") return res.status(503).json({ success: false, error: "Audit history is unavailable." });
  const requestedLimit = Number.parseInt(String(req.query.limit || "200"), 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(500, Math.max(1, requestedLimit)) : 200;
  try {
    let query = serverSupabase.from("audit_logs").select("id,created_at,action,entity_type,entity_id,user_id,old_data,new_data").order("created_at", { ascending: false }).limit(limit);
    if (typeof req.query.action === "string" && /^[A-Z0-9_]{1,100}$/.test(req.query.action)) query = query.eq("action", req.query.action);
    if (typeof req.query.entity_type === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(req.query.entity_type)) query = query.eq("entity_type", req.query.entity_type);
    if (typeof req.query.entity_id === "string" && req.query.entity_id.length <= 120) query = query.eq("entity_id", req.query.entity_id);
    if (typeof req.query.user_id === "string" && UUID_PATTERN.test(req.query.user_id)) query = query.eq("user_id", req.query.user_id);
    const fromDate = typeof req.query.from === "string" ? new Date(req.query.from) : null;
    const toDate = typeof req.query.to === "string" ? new Date(req.query.to) : null;
    if (fromDate && Number.isFinite(fromDate.getTime())) query = query.gte("created_at", fromDate.toISOString());
    if (toDate && Number.isFinite(toDate.getTime())) query = query.lte("created_at", toDate.toISOString());
    const { data, error } = await query;
    if (error) throw error;
    const privateKey = /(email|phone|whatsapp|address|name|message|description|body|content|subject|notes?|password|token|secret|api.?key|authorization|headers|payload|metadata|user.?agent|cookies?|room|hotel|special.?requests?|contact|recipient|sender|customer|guest|user.?id|payment.?details?|card|cvv|ssn|passport|document|birth|dob|attachment|avatar|settings|config|form.?data|custom.?data|preferences|value|text|comment|question|answer|reason|details?|context|input|output|form|fields|actor.?id|profile.?id|visitor.?id|session.?id|ip_address|(^ip$|_ip$|^ip_))/i;
    const safeSnapshot = (value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return null;
      return Object.fromEntries(Object.entries(value).filter(([key, item]) => {
        if (privateKey.test(key) || item !== null && !["string", "number", "boolean"].includes(typeof item)) return false;
        if (typeof item === "string" && (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(item) || /\+?\d[\d\s().-]{7,}\d/.test(item))) return false;
        return true;
      }).map(([key, item]) => [key, typeof item === "string" ? item.slice(0, 160) : item]));
    };
    return res.json({ records: (data || []).map((record) => ({ ...record, old_data: safeSnapshot(record.old_data), new_data: safeSnapshot(record.new_data) })) });
  } catch (error) {
    console.error("[Technical Control Center] Audit log query failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(503).json({ success: false, error: "Audit history is temporarily unavailable." });
  }
});
app.get("/api/admin/technical/events", rateLimit(60, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") {
    return res.status(503).json({ success: false, error: "Technical diagnostics require the server-side Supabase secret." });
  }
  const requestedLimit = Number.parseInt(String(req.query.limit || "100"), 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(200, Math.max(1, requestedLimit)) : 100;
  const severity = String(req.query.severity || "");
  if (severity && !["info", "warning", "error"].includes(severity)) {
    return res.status(400).json({ success: false, error: "Invalid severity filter." });
  }
  try {
    let query = serverSupabase.from("technical_events").select("id,created_at,severity,event_type,source,message,request_method,request_path,status_code,duration_ms,actor_user_id,metadata").order("created_at", { ascending: false }).limit(limit);
    if (severity) query = query.eq("severity", severity);
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ events: data || [] });
  } catch (error) {
    console.error("[Technical Control Center] Event query failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(503).json({ success: false, error: "Technical event log is temporarily unavailable." });
  }
});
var VISITOR_EVENT_NAMES = /* @__PURE__ */ new Set([
  "page_view",
  "page_exit",
  "navigation",
  "tour_view",
  "search",
  "booking_started",
  "booking_step_completed",
  "booking_submitted",
  "booking_confirmed",
  "booking_cancelled",
  "custom",
  "auth_sign_in",
  "auth_sign_in_failed",
  "auth_sign_up",
  "auth_sign_out",
  "password_reset_requested",
  "password_changed",
  "profile_updated",
  "inquiry_submitted",
  "newsletter_subscribed",
  "booking_lookup",
  "booking_cancellation_requested",
  "support_ticket_created",
  "support_reply_sent",
  "support_ticket_updated",
  "tour_search",
  "tour_filter_applied",
  "wishlist_updated",
  "comparison_updated",
  "chatbot_interaction",
  "contact_request_submitted",
  "booking_step_viewed",
  "review_submitted",
  "tour_shared",
  "language_changed",
  "currency_changed",
  "confirmation_email_resent",
  "email_confirmed",
  "mfa_verified"
]);
var VISITOR_EVENT_FIELDS = /* @__PURE__ */ new Set([
  "tour_slug",
  "category",
  "destination",
  "booking_step",
  "result_count",
  "currency",
  "sort_order",
  "filter_count",
  "form_name",
  "interaction",
  "action",
  "outcome",
  "channel",
  "role",
  "source",
  "ticket_category",
  "priority",
  "status",
  "auth_method",
  "search_type",
  "language"
]);
var UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var visitorGeoCache = /* @__PURE__ */ new Map();
function isPrivateOrReservedIp(value, family) {
  const ip = value.toLowerCase();
  if (family === 4) {
    const octets = ip.split(".").map(Number);
    if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
    const [a, b, c] = octets;
    return a === 0 || a === 10 || a === 127 || a >= 224 || a === 100 && b >= 64 && b <= 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && (b === 168 || b === 0 && (c === 0 || c === 2)) || a === 198 && (b === 18 || b === 19 || b === 51 && c === 100) || a === 203 && b === 0 && c === 113;
  }
  if (ip.startsWith("::ffff:")) {
    const mapped = ip.slice(7);
    return isPrivateOrReservedIp(mapped, isIP(mapped));
  }
  return ip === "::" || ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80:") || ip.startsWith("ff") || ip.startsWith("2001:db8:");
}
async function lookupApproximateVisitorLocation(rawIp) {
  const suppliedIp = (rawIp || "").trim();
  const ip = suppliedIp.toLowerCase().startsWith("::ffff:") ? suppliedIp.slice(7) : suppliedIp;
  const family = isIP(ip);
  if (!family || isPrivateOrReservedIp(ip, family)) return null;
  const cacheKey = createHash("sha256").update(ip).digest("hex");
  const cached = visitorGeoCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  if (cached) visitorGeoCache.delete(cacheKey);
  let value = null;
  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country,country_code,region,region_code,city`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(2500)
    });
    if (response.ok) {
      const body = await response.json().catch(() => null);
      if (body?.success === true) {
        const countryCode = typeof body.country_code === "string" && /^[A-Z]{2}$/.test(body.country_code) ? body.country_code : null;
        const regionCode = safeShortText(body.region_code, 24);
        const countryName = safeShortText(body.country, 80);
        const regionName = safeShortText(body.region, 80);
        const city = safeShortText(body.city, 80);
        if (countryCode || countryName || regionName || city) {
          value = { country_code: countryCode, country_name: countryName, region_code: regionCode, region_name: regionName, city, location_source: "ip_approximate" };
        }
      }
    }
  } catch {
  }
  visitorGeoCache.set(cacheKey, { expiresAt: Date.now() + (value ? 6 : 1) * 60 * 60 * 1e3, value });
  if (visitorGeoCache.size > 2500) {
    const oldestKey = visitorGeoCache.keys().next().value;
    if (oldestKey) visitorGeoCache.delete(oldestKey);
  }
  return value;
}
function safeShortText(value, max = 120) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, max);
  return cleaned || null;
}
function safePagePath(value) {
  if (typeof value !== "string" || !value.startsWith("/")) return "/";
  return value.split(/[?#]/, 1)[0].replace(/[\u0000-\u001f]/g, "").slice(0, 512) || "/";
}
function safeVisitorMetadata(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const device = ["desktop", "mobile", "tablet", "other"].includes(source.device_type) ? source.device_type : null;
  const screen = typeof source.screen_bucket === "string" && /^(small|medium|large|xlarge)$/.test(source.screen_bucket) ? source.screen_bucket : null;
  const localeCandidate = safeShortText(source.locale, 35);
  const locale = localeCandidate && /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(localeCandidate) ? localeCandidate : null;
  const languagePreferences = Array.isArray(source.language_preferences) ? Array.from(new Set(source.language_preferences.slice(0, 8).filter(
    (item) => typeof item === "string" && /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(item)
  ))).slice(0, 8) : [];
  const platformFamily = ["Windows", "macOS", "Linux", "Android", "iOS", "ChromeOS", "Other"].includes(source.platform_family) ? source.platform_family : null;
  const viewportBucket = ["compact", "standard", "wide"].includes(source.viewport_bucket) ? source.viewport_bucket : null;
  const safeCampaignValue = (input, max) => {
    const candidate = safeShortText(input, max);
    if (!candidate || /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(candidate) || /\+?\d[\d\s().-]{7,}\d/.test(candidate)) return null;
    return candidate;
  };
  return {
    device_type: device,
    browser_family: safeShortText(source.browser_family, 40),
    os_family: safeShortText(source.os_family, 40),
    screen_bucket: screen,
    language: safeShortText(source.language, 24),
    locale,
    language_preferences: languagePreferences,
    platform_family: platformFamily,
    is_mobile: typeof source.is_mobile === "boolean" ? source.is_mobile : null,
    viewport_bucket: viewportBucket,
    timezone: safeShortText(source.timezone, 64),
    country_code: null,
    country_name: null,
    region_code: null,
    region_name: null,
    city: null,
    location_source: null,
    referrer_host: safeShortText(source.referrer_host, 120),
    utm_source: safeCampaignValue(source.utm_source, 100),
    utm_medium: safeCampaignValue(source.utm_medium, 100),
    utm_campaign: safeCampaignValue(source.utm_campaign, 120),
    utm_term: safeCampaignValue(source.utm_term, 120),
    utm_content: safeCampaignValue(source.utm_content, 120)
  };
}
function safeVisitorEventData(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const result = {};
  for (const key of Object.keys(source)) {
    if (!VISITOR_EVENT_FIELDS.has(key)) continue;
    const item = source[key];
    if (typeof item === "string") {
      const safe = safeShortText(item, 120);
      if (safe) result[key] = safe;
    } else if (typeof item === "number" && Number.isFinite(item)) {
      result[key] = Math.max(-1e6, Math.min(1e6, item));
    } else if (typeof item === "boolean") {
      result[key] = item;
    }
  }
  return result;
}
app.post("/api/visitor/consent", rateLimit(20, 6e4), async (req, res) => {
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") {
    return res.status(503).json({ success: false, error: "Privacy settings are temporarily unavailable." });
  }
  const consentVersion = req.body?.consent_version === "2" ? "2" : "1";
  const analytics = consentVersion === "2" && req.body?.analytics === true;
  const marketing = consentVersion === "2" && req.body?.marketing === true;
  const sessionId = typeof req.body?.session_id === "string" && UUID_PATTERN.test(req.body.session_id) ? req.body.session_id : null;
  const visitorId = typeof req.body?.visitor_id === "string" && UUID_PATTERN.test(req.body.visitor_id) ? req.body.visitor_id : null;
  const metadata = safeVisitorMetadata(req.body?.metadata);
  try {
    const location = analytics && sessionId && visitorId ? await lookupApproximateVisitorLocation(req.ip || null) : null;
    const sessionMetadata = { ...metadata, ...location || {} };
    if (analytics && sessionId && visitorId) {
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const { error: sessionError } = await serverSupabase.from("visitor_sessions").upsert({
        id: sessionId,
        visitor_id: visitorId,
        user_id: req.user?.id || null,
        started_at: now,
        last_seen_at: now,
        landing_path: safePagePath(req.body?.landing_path),
        ...sessionMetadata,
        analytics_consent: true,
        marketing_consent: marketing,
        consent_updated_at: now
      }, { onConflict: "id", ignoreDuplicates: true });
      if (sessionError) throw sessionError;
      const { error: updateError } = await serverSupabase.from("visitor_sessions").update({
        user_id: req.user?.id || null,
        last_seen_at: now,
        ended_at: null,
        ...sessionMetadata,
        analytics_consent: true,
        marketing_consent: marketing,
        consent_updated_at: now
      }).eq("id", sessionId);
      if (updateError) throw updateError;
    } else if (sessionId) {
      await serverSupabase.from("visitor_sessions").update({
        analytics_consent: false,
        marketing_consent: false,
        ended_at: (/* @__PURE__ */ new Date()).toISOString(),
        consent_updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", sessionId);
    }
    if (req.body?.source === "session_restore") return res.status(200).json({ success: true, restored: true });
    const { error } = await serverSupabase.from("visitor_consent_records").insert({
      visitor_session_id: sessionId,
      visitor_id: analytics ? visitorId : null,
      user_id: req.user?.id || null,
      necessary: true,
      analytics,
      marketing,
      consent_version: consentVersion,
      consent_source: ["cookie_banner", "privacy_settings", "account_settings"].includes(req.body?.source) ? req.body.source : "cookie_banner"
    });
    if (error) throw error;
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error("[Visitor privacy] Consent record failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(503).json({ success: false, error: "Your privacy choice could not be saved to our records. Your browser choice remains active on this device." });
  }
});
app.post("/api/visitor/events", rateLimit(90, 6e4), async (req, res) => {
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") {
    return res.status(503).json({ success: false, error: "Visitor analytics are temporarily unavailable." });
  }
  const sessionId = typeof req.body?.session_id === "string" && UUID_PATTERN.test(req.body.session_id) ? req.body.session_id : null;
  const eventName = typeof req.body?.event_name === "string" ? req.body.event_name : "";
  if (!sessionId || !VISITOR_EVENT_NAMES.has(eventName)) {
    return res.status(400).json({ success: false, error: "Invalid visitor event." });
  }
  try {
    const { data: session, error: sessionError } = await serverSupabase.from("visitor_sessions").select("id,analytics_consent").eq("id", sessionId).maybeSingle();
    if (sessionError) throw sessionError;
    if (!session?.analytics_consent) return res.status(204).end();
    const duration = Number(req.body?.duration_ms);
    const { error } = await serverSupabase.from("visitor_events").insert({
      session_id: sessionId,
      user_id: req.user?.id || null,
      event_name: eventName,
      page_path: safePagePath(req.body?.page_path),
      page_title: safeShortText(req.body?.page_title, 160),
      duration_ms: Number.isFinite(duration) ? Math.max(0, Math.min(864e5, Math.round(duration))) : null,
      event_data: safeVisitorEventData(req.body?.event_data)
    });
    if (error) throw error;
    await serverSupabase.from("visitor_sessions").update({
      last_seen_at: (/* @__PURE__ */ new Date()).toISOString(),
      user_id: req.user?.id || null
    }).eq("id", sessionId);
    return res.status(202).json({ success: true });
  } catch (error) {
    console.error("[Visitor analytics] Event ingestion failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(503).json({ success: false, error: "Visitor activity could not be recorded." });
  }
});
app.get("/api/admin/technical/visitors/overview", rateLimit(30, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") return res.status(503).json({ success: false, error: "Visitor analytics are unavailable." });
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString();
  try {
    const { data, error } = await serverSupabase.rpc("get_visitor_analytics_overview", { p_since: since });
    if (error) throw error;
    return res.json(data || {});
  } catch (error) {
    console.error("[Visitor analytics] Overview failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(503).json({ success: false, error: "Visitor analytics summary is temporarily unavailable." });
  }
});
app.get("/api/admin/technical/visitors/events", rateLimit(60, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") return res.status(503).json({ success: false, error: "Visitor analytics are unavailable." });
  const limit = Math.min(500, Math.max(1, Number.parseInt(String(req.query.limit || "200"), 10) || 200));
  try {
    let query = serverSupabase.from("visitor_events").select("id,occurred_at,session_id,user_id,event_name,page_path,page_title,duration_ms,event_data").order("occurred_at", { ascending: false }).limit(limit);
    if (typeof req.query.event_name === "string" && VISITOR_EVENT_NAMES.has(req.query.event_name)) query = query.eq("event_name", req.query.event_name);
    if (typeof req.query.session_id === "string" && UUID_PATTERN.test(req.query.session_id)) query = query.eq("session_id", req.query.session_id);
    if (typeof req.query.user_id === "string" && UUID_PATTERN.test(req.query.user_id)) query = query.eq("user_id", req.query.user_id);
    if (typeof req.query.page_path === "string" && req.query.page_path.startsWith("/")) query = query.eq("page_path", safePagePath(req.query.page_path));
    const fromDate = typeof req.query.from === "string" ? new Date(req.query.from) : null;
    const toDate = typeof req.query.to === "string" ? new Date(req.query.to) : null;
    if (fromDate && Number.isFinite(fromDate.getTime())) query = query.gte("occurred_at", fromDate.toISOString());
    if (toDate && Number.isFinite(toDate.getTime())) query = query.lte("occurred_at", toDate.toISOString());
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ events: data || [] });
  } catch (error) {
    console.error("[Visitor analytics] Events query failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(503).json({ success: false, error: "Visitor activity is temporarily unavailable." });
  }
});
app.get("/api/admin/technical/visitors/sessions", rateLimit(60, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") return res.status(503).json({ success: false, error: "Visitor analytics are unavailable." });
  const limit = Math.min(500, Math.max(1, Number.parseInt(String(req.query.limit || "150"), 10) || 150));
  try {
    let query = serverSupabase.from("visitor_sessions").select("id,visitor_id,user_id,started_at,last_seen_at,ended_at,landing_path,referrer_host,utm_source,utm_medium,utm_campaign,utm_term,utm_content,device_type,browser_family,os_family,screen_bucket,language,locale,language_preferences,platform_family,is_mobile,viewport_bucket,timezone,country_code,country_name,region_code,region_name,city,location_source,analytics_consent,marketing_consent").order("last_seen_at", { ascending: false }).limit(limit);
    if (typeof req.query.search === "string" && UUID_PATTERN.test(req.query.search)) query = query.or(`id.eq.${req.query.search},visitor_id.eq.${req.query.search},user_id.eq.${req.query.search}`);
    if (typeof req.query.device_type === "string" && ["desktop", "mobile", "tablet", "other"].includes(req.query.device_type)) query = query.eq("device_type", req.query.device_type);
    if (typeof req.query.user_id === "string" && UUID_PATTERN.test(req.query.user_id)) query = query.eq("user_id", req.query.user_id);
    if (typeof req.query.page_path === "string" && req.query.page_path.startsWith("/")) query = query.eq("landing_path", safePagePath(req.query.page_path));
    const fromDate = typeof req.query.from === "string" ? new Date(req.query.from) : null;
    const toDate = typeof req.query.to === "string" ? new Date(req.query.to) : null;
    if (fromDate && Number.isFinite(fromDate.getTime())) query = query.gte("started_at", fromDate.toISOString());
    if (toDate && Number.isFinite(toDate.getTime())) query = query.lte("last_seen_at", toDate.toISOString());
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ sessions: data || [] });
  } catch (error) {
    console.error("[Visitor analytics] Sessions query failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(503).json({ success: false, error: "Visitor sessions are temporarily unavailable." });
  }
});
app.get("/api/admin/technical/visitors/consent", rateLimit(30, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") return res.status(503).json({ success: false, error: "Consent history is unavailable." });
  const limit = Math.min(200, Math.max(1, Number.parseInt(String(req.query.limit || "100"), 10) || 100));
  try {
    const { data, error } = await serverSupabase.from("visitor_consent_records").select("id,visitor_session_id,visitor_id,user_id,necessary,analytics,marketing,consent_version,consent_source,recorded_at").order("recorded_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return res.json({ records: data || [] });
  } catch (error) {
    console.error("[Visitor privacy] Consent history query failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(503).json({ success: false, error: "Consent history is temporarily unavailable." });
  }
});
app.post("/api/admin/technical/visitors/erase", rateLimit(5, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") return res.status(503).json({ success: false, error: "Visitor data controls are unavailable." });
  const identifierType = req.body?.identifier_type;
  const identifier = typeof req.body?.identifier === "string" && UUID_PATTERN.test(req.body.identifier) ? req.body.identifier : null;
  if (!["visitor_id", "user_id"].includes(identifierType) || !identifier) return res.status(400).json({ success: false, error: "Choose a visitor or user ID and enter a valid UUID." });
  try {
    const { data, error } = await serverSupabase.rpc("erase_visitor_analytics", {
      p_identifier_type: identifierType,
      p_identifier: identifier,
      p_actor: req.user.id
    });
    if (error) throw error;
    return res.json({ success: true, ...data || {} });
  } catch (error) {
    console.error("[Visitor privacy] Erasure failed:", error instanceof Error ? error.message : "unknown error");
    return res.status(503).json({ success: false, error: "Visitor analytics could not be erased. No business bookings or payment records were changed." });
  }
});
app.get("/api/admin/technical/visitors/settings", rateLimit(30, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") return res.status(503).json({ success: false, error: "Retention settings are unavailable." });
  const { data, error } = await serverSupabase.from("visitor_analytics_settings").select("*").eq("singleton", true).maybeSingle();
  if (error) return res.status(503).json({ success: false, error: "Retention settings are unavailable." });
  return res.json({ settings: data });
});
app.post("/api/admin/technical/visitors/settings", rateLimit(10, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") return res.status(503).json({ success: false, error: "Retention settings are unavailable." });
  const eventDays = Number(req.body?.event_retention_days);
  const sessionDays = Number(req.body?.session_retention_days);
  const consentDays = Number(req.body?.consent_retention_days);
  const technicalDays = Number(req.body?.technical_event_retention_days);
  const auditDays = Number(req.body?.audit_log_retention_days);
  if (!Number.isInteger(eventDays) || eventDays < 7 || eventDays > 730 || !Number.isInteger(sessionDays) || sessionDays < 7 || sessionDays > 1095 || !Number.isInteger(consentDays) || consentDays < 90 || consentDays > 3650 || !Number.isInteger(technicalDays) || technicalDays < 7 || technicalDays > 730 || !Number.isInteger(auditDays) || auditDays < 365 || auditDays > 3650) {
    return res.status(400).json({ success: false, error: "Retention periods are outside the allowed ranges." });
  }
  const { data, error } = await serverSupabase.from("visitor_analytics_settings").update({
    event_retention_days: eventDays,
    session_retention_days: sessionDays,
    consent_retention_days: consentDays,
    technical_event_retention_days: technicalDays,
    audit_log_retention_days: auditDays,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_by: req.user.id
  }).eq("singleton", true).select("*").single();
  if (error) return res.status(503).json({ success: false, error: "Retention settings could not be saved." });
  await serverSupabase.from("audit_logs").insert({
    user_id: req.user.id,
    action: "VISITOR_ANALYTICS_RETENTION_UPDATED",
    entity_type: "visitor_analytics_settings",
    entity_id: "default",
    new_data: { event_retention_days: eventDays, session_retention_days: sessionDays, consent_retention_days: consentDays, technical_event_retention_days: technicalDays, audit_log_retention_days: auditDays }
  });
  return res.json({ success: true, settings: data });
});
async function pruneVisitorAnalytics() {
  if (!serverSupabase || SUPABASE_KEY_TYPE !== "service_role") return;
  try {
    const { data: settings, error: settingsError } = await serverSupabase.from("visitor_analytics_settings").select("event_retention_days,session_retention_days,consent_retention_days,technical_event_retention_days,audit_log_retention_days").eq("singleton", true).maybeSingle();
    if (settingsError || !settings) return;
    const now = Date.now();
    const eventCutoff = new Date(now - settings.event_retention_days * 864e5).toISOString();
    const sessionCutoff = new Date(now - settings.session_retention_days * 864e5).toISOString();
    const consentCutoff = new Date(now - settings.consent_retention_days * 864e5).toISOString();
    const technicalCutoff = new Date(now - settings.technical_event_retention_days * 864e5).toISOString();
    const auditCutoff = new Date(now - settings.audit_log_retention_days * 864e5).toISOString();
    const [events, sessions, consents, technical, audit] = await Promise.all([
      serverSupabase.from("visitor_events").delete().lt("occurred_at", eventCutoff),
      serverSupabase.from("visitor_sessions").delete().lt("last_seen_at", sessionCutoff),
      serverSupabase.from("visitor_consent_records").delete().lt("recorded_at", consentCutoff),
      serverSupabase.from("technical_events").delete().lt("created_at", technicalCutoff),
      serverSupabase.from("audit_logs").delete().lt("created_at", auditCutoff)
    ]);
    if (events.error || sessions.error || consents.error || technical.error || audit.error) {
      console.error("[Visitor analytics retention] Cleanup did not fully complete.");
    }
  } catch (error) {
    console.error("[Visitor analytics retention] Cleanup failed:", error instanceof Error ? error.message : "unknown error");
  }
}
function validAuthUserId(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
async function writeAccountAudit(actorId, action, targetId, data) {
  if (!serverSupabase) return;
  const { error } = await serverSupabase.from("audit_logs").insert({
    user_id: actorId,
    action,
    entity_type: "auth_user",
    entity_id: targetId,
    new_data: data
  });
  if (error) console.error("[Admin account audit] Could not persist audit event:", error.message);
}
app.get("/api/admin/users", rateLimit(20, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  try {
    const users = [];
    let truncated = false;
    for (let page = 1; page <= 20; page += 1) {
      const { data, error } = await serverSupabase.auth.admin.listUsers({ page, perPage: 100 });
      if (error) throw error;
      const batch = data?.users || [];
      users.push(...batch.map((account) => {
        const bannedUntil = account.banned_until || null;
        return {
          id: account.id,
          email: account.email || "",
          full_name: account.user_metadata?.full_name || account.user_metadata?.name || "",
          created_at: account.created_at,
          last_sign_in_at: account.last_sign_in_at || null,
          is_confirmed: Boolean(account.email_confirmed_at || account.confirmed_at),
          is_suspended: Boolean(bannedUntil && Date.parse(bannedUntil) > Date.now())
        };
      }));
      if (batch.length < 100) break;
      if (page === 20) truncated = true;
    }
    return res.json({ success: true, users, truncated });
  } catch (error) {
    console.error("[Admin Auth directory] Could not list Auth users:", error);
    return res.status(502).json({ success: false, error: "Could not load the secure Auth directory. Please retry." });
  }
});
app.post("/api/admin/users/invite", rateLimit(5, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const fullName = typeof req.body?.full_name === "string" ? req.body.full_name.trim().slice(0, 120) : "";
  if (!isValidEmail2(email)) return res.status(400).json({ success: false, error: "Enter a valid email address." });
  try {
    const { data, error } = await serverSupabase.auth.admin.inviteUserByEmail(email, {
      data: fullName ? { full_name: fullName } : {},
      redirectTo: "https://kemetspirit.com/"
    });
    if (error) {
      const status = /already|exists|registered/i.test(error.message) ? 409 : 400;
      return res.status(status).json({ success: false, error: status === 409 ? "An account with this email already exists." : "The invitation could not be sent. Check Supabase Auth email configuration." });
    }
    if (!data.user) return res.status(502).json({ success: false, error: "Supabase did not return the invited account." });
    await writeAccountAudit(req.user.id, "AUTH_USER_INVITED", data.user.id, { email, full_name: fullName || null });
    return res.status(201).json({ success: true, user_id: data.user.id, email, message: "Invitation email sent." });
  } catch (error) {
    console.error("[Admin account invite] Failed:", error);
    return res.status(500).json({ success: false, error: "The invitation service failed. No success was reported." });
  }
});
app.get("/api/admin/users/:userId/status", rateLimit(60, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  if (!validAuthUserId(req.params.userId)) return res.status(400).json({ success: false, error: "Invalid account identifier." });
  try {
    const { data, error } = await serverSupabase.auth.admin.getUserById(req.params.userId);
    if (error || !data.user) return res.status(404).json({ success: false, error: "Account not found." });
    const bannedUntil = data.user.banned_until || null;
    return res.json({ success: true, is_suspended: Boolean(bannedUntil && Date.parse(bannedUntil) > Date.now()), banned_until: bannedUntil });
  } catch (error) {
    console.error("[Admin account status] Failed:", error);
    return res.status(500).json({ success: false, error: "Could not retrieve account status." });
  }
});
app.post("/api/admin/users/:userId/status", rateLimit(10, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  const targetId = req.params.userId;
  const action = req.body?.action;
  if (!validAuthUserId(targetId) || !["suspend", "reactivate"].includes(action)) {
    return res.status(400).json({ success: false, error: "A valid account and suspend/reactivate action are required." });
  }
  if (targetId === req.user.id && action === "suspend") {
    return res.status(409).json({ success: false, error: "You cannot suspend your own active administrator session." });
  }
  try {
    const { data: target, error: targetError } = await serverSupabase.auth.admin.getUserById(targetId);
    if (targetError || !target.user) return res.status(404).json({ success: false, error: "Account not found." });
    const { data: profile } = await serverSupabase.from("profiles").select("role").eq("id", targetId).maybeSingle();
    const { data: roleRows } = await serverSupabase.from("user_roles").select("access_roles!inner(slug)").eq("user_id", targetId);
    const assignedRoles = (roleRows || []).flatMap((row) => {
      const roles = row.access_roles;
      return Array.isArray(roles) ? roles.map((role) => role.slug) : roles?.slug ? [roles.slug] : [];
    });
    if (profile?.role === "super_admin" || assignedRoles.includes("super_admin")) {
      return res.status(409).json({ success: false, error: "Protected Super Admin accounts cannot be suspended or reactivated here." });
    }
    if (!SUPABASE_URL || !SUPABASE_USER_KEY) {
      return res.status(503).json({ success: false, error: "A publishable Supabase key is required for secure role synchronization." });
    }
    const callerToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
    const callerSupabase = createClient(SUPABASE_URL, SUPABASE_USER_KEY, {
      global: { headers: { Authorization: "Bearer " + callerToken } },
      auth: { persistSession: false, autoRefreshToken: false }
    });
    if (action === "suspend") {
      const savedRoles = assignedRoles.length ? assignedRoles : ["customer"];
      const nextMetadata = { ...target.user.app_metadata || {}, suspended_roles: savedRoles };
      const { error: metadataError } = await serverSupabase.auth.admin.updateUserById(targetId, { app_metadata: nextMetadata });
      if (metadataError) return res.status(502).json({ success: false, error: "Could not securely preserve the account role assignments." });
      const { data: roleResult, error: roleError } = await callerSupabase.rpc("admin_assign_user_roles", {
        p_user_id: targetId,
        p_role_slugs: ["customer"]
      });
      if (roleError || !roleResult?.success) {
        const rollbackMetadata = { ...target.user.app_metadata || {} };
        delete rollbackMetadata.suspended_roles;
        await serverSupabase.auth.admin.updateUserById(targetId, { app_metadata: rollbackMetadata });
        return res.status(502).json({ success: false, error: "Could not remove privileged roles; the account was not suspended." });
      }
    } else {
      const saved = target.user.app_metadata?.suspended_roles;
      const restoreRoles = Array.isArray(saved) && saved.length ? saved.filter((role) => typeof role === "string") : ["customer"];
      const { data: roleResult, error: roleError } = await callerSupabase.rpc("admin_assign_user_roles", {
        p_user_id: targetId,
        p_role_slugs: restoreRoles
      });
      if (roleError || !roleResult?.success) {
        return res.status(502).json({ success: false, error: "Could not restore the account role assignments. The account remains suspended." });
      }
      const nextMetadata = { ...target.user.app_metadata || {} };
      delete nextMetadata.suspended_roles;
      const { error: metadataError } = await serverSupabase.auth.admin.updateUserById(targetId, {
        app_metadata: nextMetadata,
        ban_duration: "none"
      });
      if (metadataError) return res.status(502).json({ success: false, error: "Roles were restored but Supabase Auth could not reactivate the account. Retry reactivation." });
    }
    if (action === "suspend") {
      const { data: banned, error: banError } = await serverSupabase.auth.admin.updateUserById(targetId, { ban_duration: "876000h" });
      if (banError || !banned.user) {
        return res.status(502).json({ success: false, error: "Privileged roles were removed, but Supabase Auth could not apply the account suspension. Retry after checking Auth status." });
      }
      await writeAccountAudit(req.user.id, "AUTH_USER_SUSPENDED", targetId, { email: target.user.email || null, previous_roles: assignedRoles });
      const bannedUntil2 = banned.user.banned_until || null;
      return res.json({ success: true, is_suspended: Boolean(bannedUntil2 && Date.parse(bannedUntil2) > Date.now()), banned_until: bannedUntil2 });
    }
    await writeAccountAudit(req.user.id, "AUTH_USER_REACTIVATED", targetId, { email: target.user.email || null });
    const { data: active, error: activeError } = await serverSupabase.auth.admin.getUserById(targetId);
    if (activeError || !active.user) return res.status(502).json({ success: false, error: "Roles were restored, but account status could not be verified." });
    const bannedUntil = active.user.banned_until || null;
    return res.json({ success: true, is_suspended: Boolean(bannedUntil && Date.parse(bannedUntil) > Date.now()), banned_until: bannedUntil });
  } catch (error) {
    console.error("[Admin account status] Failed:", error);
    return res.status(500).json({ success: false, error: "The account status change failed." });
  }
});
app.post("/api/admin/users/:userId/password-reset", rateLimit(5, 6e4), async (req, res) => {
  if (!requireSuperAdminAal2(req, res)) return;
  if (!validAuthUserId(req.params.userId)) return res.status(400).json({ success: false, error: "Invalid account identifier." });
  if (!publicSupabase) return res.status(503).json({ success: false, error: "Supabase Auth email service is not configured." });
  try {
    const { data, error: lookupError } = await serverSupabase.auth.admin.getUserById(req.params.userId);
    if (lookupError || !data.user?.email) return res.status(404).json({ success: false, error: "Account email was not found." });
    const { error } = await publicSupabase.auth.resetPasswordForEmail(data.user.email, {
      redirectTo: "https://kemetspirit.com/reset-password"
    });
    if (error) {
      console.error("[Admin password reset] Email request failed:", error.message);
      return res.status(502).json({ success: false, error: "Supabase could not send the password-reset email. Verify Auth SMTP and redirect URL settings." });
    }
    await writeAccountAudit(req.user.id, "AUTH_USER_PASSWORD_RESET_REQUESTED", req.params.userId, { email: data.user.email });
    return res.json({ success: true, message: "Password-reset email requested." });
  } catch (error) {
    console.error("[Admin password reset] Failed:", error);
    return res.status(500).json({ success: false, error: "The password-reset request failed." });
  }
});
app.get("/api/auth/verify-session", rateLimit(60, 6e4), (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      authenticated: false,
      user: null,
      error: "No active session or valid Bearer token provided."
    });
  }
  return res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});
app.all("/api/db/query", rateLimit(60, 6e4), async (req, res) => {
  const body = req.body || {};
  if (body.table !== void 0 || body.tables !== void 0 || body.columns !== void 0 || body.fields !== void 0 || body.filters !== void 0 || body.filter !== void 0 || body.where !== void 0 || body.sql !== void 0 || body.rawSql !== void 0 || body.raw_sql !== void 0 || body.query !== void 0 || body.query_text !== void 0 || body.action !== void 0) {
    return res.status(400).json({
      success: false,
      error: "Direct table, column, filter, SQL, or arbitrary action queries are strictly prohibited. Use explicit allowlisted business operations."
    });
  }
  const operation = typeof body.operation === "string" ? body.operation.trim() : "";
  if (!operation) {
    return res.status(400).json({
      success: false,
      error: 'Missing required "operation" field.'
    });
  }
  switch (operation) {
    case "get_tours": {
      const destination = typeof body.destination === "string" ? body.destination.trim().slice(0, 50) : void 0;
      const category = typeof body.category === "string" ? body.category.trim().slice(0, 50) : void 0;
      const search = typeof body.search === "string" ? body.search.trim().slice(0, 100) : void 0;
      const limit = Math.min(Math.max(1, parseInt(body.limit, 10) || 50), 100);
      if (!serverSupabase) {
        return res.status(503).json({
          success: false,
          error: "Database service is currently unconfigured or unavailable.",
          tours: [],
          count: 0
        });
      }
      try {
        let q = serverSupabase.from("tours").select("id, title, slug, price, child_price, duration_hours, duration, short_description, status, created_at").eq("status", "published").limit(limit);
        if (destination) {
          const cleanDest = destination.replace(/[%_,()]/g, "");
          if (cleanDest) q = q.ilike("destination_id", `%${cleanDest}%`);
        }
        if (search) {
          const cleanSearch = search.replace(/[%_,()]/g, "");
          if (cleanSearch) {
            q = q.or(`title.ilike.%${cleanSearch}%,short_description.ilike.%${cleanSearch}%`);
          }
        }
        const { data, error } = await q;
        if (error) {
          console.error("Database error in get_tours operation:", error.message);
          return res.status(500).json({ success: false, error: "Database query failed.", tours: [], count: 0 });
        }
        return res.json({ success: true, count: data?.length || 0, tours: data || [] });
      } catch (err) {
        console.warn("Database error in get_tours:", err);
        return res.status(500).json({ success: false, error: "Failed to retrieve tours.", tours: [], count: 0 });
      }
    }
    case "get_destinations": {
      if (!serverSupabase) {
        return res.status(503).json({
          success: false,
          error: "Database service is currently unconfigured or unavailable.",
          destinations: [],
          count: 0
        });
      }
      try {
        const { data, error } = await serverSupabase.from("destinations").select("id, name, slug, description, main_image, sort_order").order("sort_order", { ascending: true }).limit(50);
        if (error) {
          console.error("Database error in get_destinations:", error.message);
          return res.status(500).json({ success: false, error: "Failed to retrieve destinations.", destinations: [], count: 0 });
        }
        return res.json({ success: true, count: data?.length || 0, destinations: data || [] });
      } catch (err) {
        console.warn("Database error in get_destinations:", err);
        return res.status(500).json({ success: false, error: "Failed to retrieve destinations.", destinations: [], count: 0 });
      }
    }
    case "get_categories": {
      if (!serverSupabase) {
        return res.status(503).json({
          success: false,
          error: "Database service is currently unconfigured or unavailable.",
          categories: [],
          count: 0
        });
      }
      try {
        const { data, error } = await serverSupabase.from("categories").select("id, name, slug, description, icon, sort_order").order("sort_order", { ascending: true }).limit(50);
        if (error) {
          console.error("Database error in get_categories:", error.message);
          return res.status(500).json({ success: false, error: "Failed to retrieve categories.", categories: [], count: 0 });
        }
        return res.json({ success: true, count: data?.length || 0, categories: data || [] });
      } catch (err) {
        console.warn("Database error in get_categories:", err);
        return res.status(500).json({ success: false, error: "Failed to retrieve categories.", categories: [], count: 0 });
      }
    }
    case "get_my_bookings": {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: "UNAUTHORIZED: Valid user authentication token required to access customer bookings."
        });
      }
      if (!serverSupabase) {
        return res.status(503).json({
          success: false,
          error: "Database service is currently unconfigured or unavailable."
        });
      }
      try {
        const { data, error } = await serverSupabase.from("bookings").select("id, booking_reference, booking_date, status, payment_status, total, currency, created_at, tours(title, slug, primary_image)").eq("user_id", req.user.id).order("created_at", { ascending: false }).limit(50);
        if (error) {
          console.error("Database query error in get_my_bookings:", error.message);
          return res.status(500).json({ success: false, error: "Failed to retrieve bookings." });
        }
        return res.json({ success: true, count: data?.length || 0, bookings: data || [] });
      } catch (err) {
        console.warn("Database error in get_my_bookings:", err);
        return res.status(500).json({ success: false, error: "Database service error." });
      }
    }
    case "lookup_booking": {
      const reference = typeof body.reference === "string" ? body.reference.trim().toUpperCase() : "";
      const verification = typeof body.contactVerification === "string" ? body.contactVerification.trim() : typeof body.emailOrPhone === "string" ? body.emailOrPhone.trim() : "";
      if (!reference || !/^RST-\d{4}-[A-Z0-9]+$/.test(reference)) {
        return res.status(400).json({ success: false, error: "A valid booking reference is required." });
      }
      if (!serverSupabase) {
        return res.status(503).json({ success: false, error: "The reservation lookup service is temporarily unavailable." });
      }
      const isStaff = Boolean(req.user && ["admin", "super_admin", "manager", "staff"].includes(req.user.role));
      try {
        if (isStaff) {
          const { data: staffBooking, error: staffError } = await serverSupabase.from("bookings").select("id, booking_reference, booking_date, status, payment_status, payment_method, total, currency, customers(*), tours(*)").eq("booking_reference", reference).maybeSingle();
          if (staffError) {
            console.error("Staff booking lookup failed:", staffError.message);
            return res.status(503).json({ success: false, error: "The reservation lookup service is temporarily unavailable." });
          }
          if (!staffBooking) {
            return res.status(404).json({ success: false, error: "Booking not found or verification failed." });
          }
          return res.json({ success: true, booking: staffBooking });
        }
        if (!verification) {
          return res.status(400).json({
            success: false,
            error: "The email address or full phone number used during booking is required."
          });
        }
        const { data: rpcResult, error: rpcError } = await serverSupabase.rpc("lookup_booking_secure", {
          p_reference: reference,
          p_verification: verification
        });
        if (rpcError) {
          console.error("Secure booking lookup RPC failed:", rpcError.message);
          if (rpcError.message?.toLowerCase().includes("too many")) {
            return res.status(429).json({ success: false, error: "Too many verification attempts. Please wait before trying again." });
          }
          return res.status(503).json({ success: false, error: "The reservation lookup service is temporarily unavailable." });
        }
        const rawBooking = rpcResult && typeof rpcResult === "object" ? rpcResult : null;
        if (!rawBooking?.found || !rawBooking.bookingReference) {
          return res.status(404).json({ success: false, error: "Booking not found or verification failed." });
        }
        return res.json({
          success: true,
          booking: {
            bookingReference: rawBooking.bookingReference,
            status: rawBooking.status,
            paymentStatus: rawBooking.paymentStatus,
            paymentMethod: rawBooking.paymentMethod,
            bookingDate: rawBooking.bookingDate,
            createdAt: rawBooking.createdAt,
            guests: rawBooking.guests,
            tour: rawBooking.tour,
            pickup: rawBooking.pickup,
            pricing: rawBooking.pricing,
            customer: {
              firstName: rawBooking.customer?.firstName,
              lastName: rawBooking.customer?.lastName,
              emailMasked: rawBooking.customer?.emailMasked,
              phoneMasked: rawBooking.customer?.phoneMasked,
              country: rawBooking.customer?.country
            },
            extras: rawBooking.extras,
            specialRequests: rawBooking.specialRequests
          }
        });
      } catch (err) {
        console.error("Secure booking lookup exception:", err);
        return res.status(503).json({ success: false, error: "The reservation lookup service is temporarily unavailable." });
      }
    }
    case "get_admin_overview": {
      if (!req.user || !["admin", "super_admin", "manager", "staff"].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: "FORBIDDEN: Administrative authorization required to access operational metrics."
        });
      }
      if (!serverSupabase) {
        return res.status(503).json({
          success: false,
          error: "Database service is currently unconfigured or unavailable."
        });
      }
      try {
        const [toursRes, bookingsRes, customersRes] = await Promise.all([
          serverSupabase.from("tours").select("id", { count: "exact", head: true }),
          serverSupabase.from("bookings").select("id", { count: "exact", head: true }),
          serverSupabase.from("customers").select("id", { count: "exact", head: true })
        ]);
        return res.json({
          success: true,
          metrics: {
            totalTours: toursRes.count || 0,
            totalBookings: bookingsRes.count || 0,
            totalCustomers: customersRes.count || 0,
            verifiedRole: req.user.role
          }
        });
      } catch (err) {
        console.warn("Database error in get_admin_overview:", err);
        return res.status(500).json({ success: false, error: "Failed to retrieve administrative metrics." });
      }
    }
    default:
      return res.status(400).json({
        success: false,
        error: `Unrecognized business operation "${operation}". Unrestricted table access is strictly prohibited.`
      });
  }
});
var KEMETSPIRIT_PUBLIC_ORIGIN = "https://kemetspirit.com";
var KEMETSPIRIT_CORE_PUBLIC_PATHS = [
  "/",
  "/excursions",
  "/experiences",
  "/blog",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cancellation-policy",
  "/cookie-policy"
];
function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function toSitemapDate(value) {
  if (typeof value !== "string" || !value.trim()) return void 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? void 0 : date.toISOString().slice(0, 10);
}
function cleanPublicText(value, maxLength = 500) {
  return typeof value === "string" ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}
app.get("/sitemap.xml", async (_req, res) => {
  const urls = /* @__PURE__ */ new Map();
  for (const route of KEMETSPIRIT_CORE_PUBLIC_PATHS) {
    urls.set(`${KEMETSPIRIT_PUBLIC_ORIGIN}${route === "/" ? "/" : route}`, void 0);
  }
  if (publicSupabase) {
    try {
      const { data: tours, error: toursError } = await publicSupabase.from("tours").select("slug, updated_at").eq("status", "published").order("updated_at", { ascending: false }).limit(5e3);
      if (toursError) {
        console.warn("[SEO sitemap] Published tour query failed:", toursError.message);
      } else {
        for (const tour of tours || []) {
          const slug = typeof tour.slug === "string" ? tour.slug.trim() : "";
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) continue;
          urls.set(
            `${KEMETSPIRIT_PUBLIC_ORIGIN}/excursions/${encodeURIComponent(slug)}`,
            toSitemapDate(tour.updated_at)
          );
        }
      }
    } catch (error) {
      console.warn("[SEO sitemap] Tour catalogue could not be loaded:", error);
    }
    try {
      const { data: pageSetting, error: pagesError } = await publicSupabase.from("site_settings").select("value").eq("key", "pages_content").maybeSingle();
      if (pagesError) {
        console.warn("[SEO sitemap] CMS page query failed:", pagesError.message);
      } else {
        const rawPages = pageSetting?.value;
        const pages = Array.isArray(rawPages) ? rawPages : rawPages && typeof rawPages === "object" && Array.isArray(rawPages.pages) ? rawPages.pages : [];
        for (const page of pages) {
          const slug = typeof page?.slug === "string" ? page.slug.trim() : "";
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) continue;
          if (page?.published === false || page?.status === "draft" || page?.status === "unpublished" || page?.seoIndexable === false) continue;
          urls.set(
            `${KEMETSPIRIT_PUBLIC_ORIGIN}/${encodeURIComponent(slug)}`,
            toSitemapDate(page?.updated_at || page?.lastUpdated)
          );
        }
      }
    } catch (error) {
      console.warn("[SEO sitemap] CMS pages could not be loaded:", error);
    }
    try {
      const [destinationResult, tourDestinationResult] = await Promise.all([
        publicSupabase.from("destinations").select("id,slug,updated_at,tagline,description").eq("status", "published"),
        publicSupabase.from("tours").select("destination_id").eq("status", "published")
      ]);
      if (destinationResult.error) {
        console.warn("[SEO sitemap] Published destinations query failed:", destinationResult.error.message);
      } else if (tourDestinationResult.error) {
        console.warn("[SEO sitemap] Published destination-tours query failed:", tourDestinationResult.error.message);
      } else {
        const destinationTourCounts = /* @__PURE__ */ new Map();
        for (const row of tourDestinationResult.data || []) {
          if (!row.destination_id) continue;
          const key = String(row.destination_id);
          destinationTourCounts.set(key, (destinationTourCounts.get(key) || 0) + 1);
        }
        for (const destination of destinationResult.data || []) {
          const slug = typeof destination.slug === "string" ? destination.slug.trim() : "";
          const tourCount = destinationTourCounts.get(String(destination.id)) || 0;
          const descriptionLength = cleanPublicText(destination.description, 4e3).length + cleanPublicText(destination.tagline, 500).length;
          if (tourCount < 2 && descriptionLength < 300) continue;
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) continue;
          urls.set(
            `${KEMETSPIRIT_PUBLIC_ORIGIN}/destinations/${encodeURIComponent(slug)}`,
            toSitemapDate(destination.updated_at)
          );
        }
      }
    } catch (error) {
      console.warn("[SEO sitemap] Destination pages could not be loaded:", error);
    }
  }
  if (publicSupabase) {
    try {
      const { data: posts, error } = await publicSupabase.from("blog_posts").select("slug, updated_at").in("status", ["published", "scheduled"]).lte("published_at", (/* @__PURE__ */ new Date()).toISOString()).order("published_at", { ascending: false }).limit(2e3);
      if (error) {
        console.warn("[SEO sitemap] Published blog query failed:", error.message);
      } else {
        for (const post of posts || []) {
          const slug = typeof post.slug === "string" ? post.slug.trim() : "";
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) continue;
          urls.set(`${KEMETSPIRIT_PUBLIC_ORIGIN}/blog/${encodeURIComponent(slug)}`, toSitemapDate(post.updated_at));
        }
      }
    } catch (error) {
      console.warn("[SEO sitemap] Blog catalogue could not be loaded:", error);
    }
  }
  const entries = Array.from(urls.entries()).map(([loc, lastmod]) => `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>"
  ].join("\n");
  res.status(200);
  res.type("application/xml");
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
  return res.send(xml);
});
app.get("/llms.txt", async (_req, res) => {
  const lines = [
    "# KemetSpirit",
    "",
    "> Explore excursions and experiences across Egypt\u2019s Red Sea coast. Tour pages provide current published descriptions, inclusions, pricing and booking details.",
    "",
    "## Main pages",
    "- [Homepage](https://kemetspirit.com/)",
    "- [Excursions](https://kemetspirit.com/excursions)",
    "- [Privacy Policy](https://kemetspirit.com/privacy)",
    "- [Terms & Conditions](https://kemetspirit.com/terms)",
    "- [Cancellation & Refund Policy](https://kemetspirit.com/cancellation-policy)",
    "- [Cookie Policy](https://kemetspirit.com/cookie-policy)",
    "",
    "## Published destinations and excursions"
  ];
  if (publicSupabase) {
    try {
      const { data: tours, error } = await publicSupabase.from("tours").select("title, slug, short_description, price, currency").eq("status", "published").order("sort_order", { ascending: true }).limit(500);
      if (error) {
        console.warn("[SEO llms.txt] Published tour query failed:", error.message);
      } else {
        for (const tour of tours || []) {
          const slug = typeof tour.slug === "string" ? tour.slug.trim() : "";
          const title = cleanPublicText(tour.title, 160);
          if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) continue;
          const description = cleanPublicText(tour.short_description, 400);
          const price = Number(tour.price);
          const currency = typeof tour.currency === "string" && /^[A-Z]{3}$/i.test(tour.currency) ? tour.currency.toUpperCase() : "EUR";
          const priceText = Number.isFinite(price) && price > 0 ? ` Starting price: ${price} ${currency}.` : "";
          lines.push(`- [${title}](https://kemetspirit.com/excursions/${encodeURIComponent(slug)}): ${description}${priceText}`);
        }
      }
    } catch (error) {
      console.warn("[SEO llms.txt] Tour catalogue could not be loaded:", error);
    }
  }
  if (publicSupabase) {
    lines.push("", "## Published destinations");
    try {
      const [destinationResult, tourDestinationResult] = await Promise.all([
        publicSupabase.from("destinations").select("id,name,slug,description,tagline").eq("status", "published").order("sort_order", { ascending: true }),
        publicSupabase.from("tours").select("destination_id").eq("status", "published")
      ]);
      if (destinationResult.error) {
        console.warn("[SEO llms.txt] Published destinations query failed:", destinationResult.error.message);
      } else if (tourDestinationResult.error) {
        console.warn("[SEO llms.txt] Destination tour links query failed:", tourDestinationResult.error.message);
      } else {
        const destinationTourCounts = /* @__PURE__ */ new Map();
        for (const row of tourDestinationResult.data || []) {
          if (!row.destination_id) continue;
          const key = String(row.destination_id);
          destinationTourCounts.set(key, (destinationTourCounts.get(key) || 0) + 1);
        }
        for (const destination of destinationResult.data || []) {
          const slug = typeof destination.slug === "string" ? destination.slug.trim() : "";
          const name = cleanPublicText(destination.name, 120);
          const tourCount = destinationTourCounts.get(String(destination.id)) || 0;
          const descriptionLength = cleanPublicText(destination.description, 4e3).length + cleanPublicText(destination.tagline, 500).length;
          if (!name || tourCount < 2 && descriptionLength < 300) continue;
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) continue;
          const description = cleanPublicText(destination.description, 400);
          lines.push(`- [${name}](https://kemetspirit.com/destinations/${encodeURIComponent(slug)}): ${description}`);
        }
      }
    } catch (error) {
      console.warn("[SEO llms.txt] Destination catalogue could not be loaded:", error);
    }
  }
  if (publicSupabase) {
    lines.push("", "## Published travel journal articles");
    try {
      const { data: posts, error } = await publicSupabase.from("blog_posts").select("title,slug,excerpt,published_at").in("status", ["published", "scheduled"]).lte("published_at", (/* @__PURE__ */ new Date()).toISOString()).order("published_at", { ascending: false }).limit(100);
      if (error) {
        console.warn("[SEO llms.txt] Published blog query failed:", error.message);
      } else {
        for (const post of posts || []) {
          const slug = typeof post.slug === "string" ? post.slug.trim() : "";
          const title = cleanPublicText(post.title, 160);
          if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) continue;
          lines.push(`- [${title}](https://kemetspirit.com/blog/${encodeURIComponent(slug)}): ${cleanPublicText(post.excerpt, 400)}`);
        }
      }
    } catch (error) {
      console.warn("[SEO llms.txt] Blog catalogue could not be loaded:", error);
    }
  }
  lines.push(
    "",
    "## Booking information",
    "- Check each published excursion page for its current price, availability, duration, pickup information, inclusions and cancellation terms.",
    "- Booking and availability details can change. Use the live website as the source of truth.",
    "",
    "## Sitemap",
    "- https://kemetspirit.com/sitemap.xml",
    ""
  );
  res.status(200);
  res.type("text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
  return res.send(lines.join("\n"));
});
var KEMETSPIRIT_MCP_TOOLS = [
  {
    name: "search_published_excursions",
    description: "Search published KemetSpirit excursions by words in the title or description. Returns public catalogue information only.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Optional search phrase, up to 120 characters." },
        limit: { type: "integer", minimum: 1, maximum: 20, default: 10 }
      },
      additionalProperties: false
    }
  },
  {
    name: "get_published_excursion",
    description: "Get public details for one published KemetSpirit excursion using its slug.",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", minLength: 1, maxLength: 180 } },
      required: ["slug"],
      additionalProperties: false
    }
  }
];
app.get("/.well-known/mcp/server-card.json", (_req, res) => {
  res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
  res.type("application/json");
  return res.json({
    "$schema": "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
    version: "1.0",
    protocolVersion: "2025-06-18",
    serverInfo: {
      name: "com.kemetspirit/public-excursions",
      title: "KemetSpirit Public Excursions",
      version: "1.0.0"
    },
    description: "Read-only discovery and lookup of published KemetSpirit tours and experiences across Egypt. No booking, customer data, payments or administrative actions are exposed.",
    transport: { type: "streamable-http", endpoint: "/mcp" },
    capabilities: { tools: { listChanged: false } },
    authentication: { required: false, schemes: [] },
    instructions: "Only published public excursion catalogue data is available. Confirm current prices and availability on the linked live excursion page before making travel decisions.",
    tools: KEMETSPIRIT_MCP_TOOLS
  });
});
app.post("/mcp", rateLimit(60, 6e4), async (req, res) => {
  const request = req.body;
  if (!request || typeof request !== "object" || Array.isArray(request) || request.jsonrpc !== "2.0" || typeof request.method !== "string") {
    return res.status(400).json({ jsonrpc: "2.0", id: request?.id ?? null, error: { code: -32600, message: "Invalid JSON-RPC request." } });
  }
  const id = Object.prototype.hasOwnProperty.call(request, "id") ? request.id : null;
  const reply = (result) => res.status(200).type("application/json").json({ jsonrpc: "2.0", id, result });
  const fail = (code, message) => res.status(200).type("application/json").json({ jsonrpc: "2.0", id, error: { code, message } });
  if (request.method === "notifications/initialized" || request.method.startsWith("notifications/")) {
    return res.status(202).end();
  }
  if (request.method === "initialize") {
    const requestedVersion = typeof request.params?.protocolVersion === "string" ? request.params.protocolVersion : "2025-06-18";
    const supported = ["2025-06-18", "2025-03-26"];
    return reply({
      protocolVersion: supported.includes(requestedVersion) ? requestedVersion : "2025-06-18",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "com.kemetspirit/public-excursions", title: "KemetSpirit Public Excursions", version: "1.0.0" },
      instructions: "Read-only public excursion catalogue. No bookings, personal data, payments or admin actions."
    });
  }
  if (request.method === "ping") return reply({});
  if (request.method === "tools/list") return reply({ tools: KEMETSPIRIT_MCP_TOOLS });
  if (request.method !== "tools/call") return fail(-32601, "Method not found.");
  const toolName = request.params?.name;
  const args = request.params?.arguments && typeof request.params.arguments === "object" ? request.params.arguments : {};
  if (!publicSupabase) {
    return reply({ content: [{ type: "text", text: "The public excursion catalogue is temporarily unavailable." }], isError: true });
  }
  try {
    if (toolName === "search_published_excursions") {
      const queryText = typeof args.query === "string" ? args.query.trim().slice(0, 120) : "";
      const limit = Number.isInteger(args.limit) ? Math.max(1, Math.min(20, args.limit)) : 10;
      let query = publicSupabase.from("tours").select("title,slug,short_description,price,currency,duration").eq("status", "published").order("sort_order", { ascending: true }).limit(limit);
      if (queryText) query = query.ilike("title", `%${queryText.replace(/[%_]/g, "")}%`);
      const { data, error } = await query;
      if (error) throw error;
      const tours = (data || []).map((tour) => ({
        title: cleanPublicText(tour.title, 160),
        slug: cleanPublicText(tour.slug, 180),
        description: cleanPublicText(tour.short_description, 400),
        price: Number.isFinite(Number(tour.price)) ? Number(tour.price) : null,
        currency: typeof tour.currency === "string" ? tour.currency : "EUR",
        duration: cleanPublicText(tour.duration, 100),
        url: `https://kemetspirit.com/excursions/${encodeURIComponent(String(tour.slug || ""))}`
      }));
      return reply({ content: [{ type: "text", text: JSON.stringify(tours) }], structuredContent: { tours } });
    }
    if (toolName === "get_published_excursion") {
      const slug = typeof args.slug === "string" ? args.slug.trim() : "";
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) return fail(-32602, "A valid excursion slug is required.");
      const { data, error } = await publicSupabase.from("tours").select("title,slug,short_description,description,price,currency,duration,pickup_info,cancellation_policy").eq("slug", slug).eq("status", "published").maybeSingle();
      if (error) throw error;
      if (!data) return reply({ content: [{ type: "text", text: "Published excursion not found." }], isError: true });
      const tour = {
        title: cleanPublicText(data.title, 160),
        slug: cleanPublicText(data.slug, 180),
        description: cleanPublicText(data.short_description || data.description, 1e3),
        details: cleanPublicText(data.description, 4e3),
        price: Number.isFinite(Number(data.price)) ? Number(data.price) : null,
        currency: typeof data.currency === "string" ? data.currency : "EUR",
        duration: cleanPublicText(data.duration, 100),
        pickupInformation: cleanPublicText(data.pickup_info, 1e3),
        cancellationInformation: cleanPublicText(data.cancellation_policy, 1e3),
        url: `https://kemetspirit.com/excursions/${encodeURIComponent(slug)}`
      };
      return reply({ content: [{ type: "text", text: JSON.stringify(tour) }], structuredContent: { tour } });
    }
    return fail(-32602, "Unknown tool. Use tools/list to discover available tools.");
  } catch (error) {
    console.warn("[MCP] Public excursion tool failed:", error);
    return reply({ content: [{ type: "text", text: "The public excursion catalogue is temporarily unavailable." }], isError: true });
  }
});
app.all("/mcp", (_req, res) => {
  res.setHeader("Allow", "POST");
  return res.status(405).json({ error: "Method not allowed. Use POST with a JSON-RPC request." });
});
app.use((req, res, next) => {
  const privateRoute = /^\/(?:admin(?:\/|$)|booking(?:\/|$)|my-booking(?:\/|$)|login(?:\/|$)|register(?:\/|$)|account(?:\/|$)|profile(?:\/|$)|reset-password(?:\/|$)|support(?:\/|$))/i;
  if ((req.method === "GET" || req.method === "HEAD") && privateRoute.test(req.path)) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", "private, no-store, max-age=0");
  }
  next();
});
app.use("/api/*", (_req, res) => {
  res.status(404).json({
    success: false,
    error: "API route not found",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
function seoHtmlEscape(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function seoPlainText(value, maxLength = 4e3) {
  if (typeof value !== "string") return "";
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}
function seoSafeImage(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const candidate = new URL(value.trim(), "https://kemetspirit.com");
    return candidate.protocol === "https:" && !candidate.username && !candidate.password ? candidate.toString() : "";
  } catch {
    return "";
  }
}
async function loadKemetSpiritSeoOverride(entityType, identifier, isPageSlug) {
  if (!publicSupabase || !identifier) return null;
  try {
    let query = publicSupabase.from("seo_metadata").select("seo_title,meta_description,og_image,robots_index,robots_follow").eq("entity_type", entityType);
    query = isPageSlug ? query.eq("page_slug", identifier) : query.eq("entity_id", identifier);
    const { data, error } = await query.maybeSingle();
    if (error) {
      console.warn("[SEO render] Metadata override unavailable:", error.message);
      return null;
    }
    return data || null;
  } catch (error) {
    console.warn("[SEO render] Metadata override query failed:", error);
    return null;
  }
}
function seoPrice(priceValue, currencyValue) {
  const price = Number(priceValue);
  if (!Number.isFinite(price) || price <= 0) return "";
  const currency = typeof currencyValue === "string" && /^[A-Z]{3}$/i.test(currencyValue) ? currencyValue.toUpperCase() : "EUR";
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(price);
  } catch {
    return `${price} ${currency}`;
  }
}
async function loadKemetSpiritTours() {
  if (!publicSupabase) return [];
  try {
    const { data, error } = await publicSupabase.from("tours").select("id,slug,title,short_description,description,price,currency,duration,duration_hours,destination_id,pickup_info,cancellation_policy,departure_time,updated_at,sort_order").eq("status", "published").order("sort_order", { ascending: true }).limit(500);
    if (error) {
      console.warn("[SEO render] Published tours unavailable:", error.message);
      return [];
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("[SEO render] Published tours query failed:", error);
    return [];
  }
}
async function loadKemetSpiritPages() {
  let publishedPages = [];
  if (publicSupabase) {
    try {
      const { data, error } = await publicSupabase.from("site_settings").select("value").eq("key", "pages_content").maybeSingle();
      if (!error) {
        const value = data?.value;
        if (Array.isArray(value)) publishedPages = value;
        else if (value && typeof value === "object" && Array.isArray(value.pages)) publishedPages = value.pages;
      } else {
        console.warn("[SEO render] CMS pages unavailable; safe defaults used:", error.message);
      }
    } catch (error) {
      console.warn("[SEO render] CMS pages query failed; safe defaults used:", error);
    }
  }
  const cmsSlugs = new Set(publishedPages.map((page) => typeof page?.slug === "string" ? page.slug : "").filter(Boolean));
  return [
    ...publishedPages,
    ...INITIAL_STATIC_PAGES.filter((page) => !cmsSlugs.has(page.slug))
  ];
}
async function loadKemetSpiritDestinations() {
  if (!publicSupabase) return [];
  try {
    const { data, error } = await publicSupabase.from("destinations").select("id,name,slug,tagline,description,main_image,seo_title,seo_description,updated_at").eq("status", "published").order("sort_order", { ascending: true }).limit(100);
    if (error) {
      console.warn("[SEO render] Published destinations unavailable:", error.message);
      return [];
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("[SEO render] Published destinations query failed:", error);
    return [];
  }
}
function seoDestinationCard(destination) {
  const slug = typeof destination?.slug === "string" ? destination.slug.trim() : "";
  const name = seoPlainText(destination?.name, 120);
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) return "";
  const description = seoPlainText(destination?.seo_description || destination?.description || destination?.tagline, 400);
  return `<article class="seo-tour-card"><h2><a href="/destinations/${encodeURIComponent(slug)}">${seoHtmlEscape(name)}</a></h2>
    ${description ? `<p>${seoHtmlEscape(description)}</p>` : ""}
    <p><a href="/destinations/${encodeURIComponent(slug)}">Explore ${seoHtmlEscape(name)}</a></p></article>`;
}
function seoTourCard(tour) {
  const slug = typeof tour?.slug === "string" ? tour.slug.trim() : "";
  const title = seoPlainText(tour?.title, 160);
  if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) return "";
  const description = seoPlainText(tour?.short_description || tour?.description, 400);
  const duration = seoPlainText(tour?.duration, 80);
  const price = seoPrice(tour?.price, tour?.currency);
  return `<article class="seo-tour-card"><h2><a href="/excursions/${encodeURIComponent(slug)}">${seoHtmlEscape(title)}</a></h2>
    ${description ? `<p>${seoHtmlEscape(description)}</p>` : ""}
    ${duration ? `<p>Duration: ${seoHtmlEscape(duration)}</p>` : ""}
    ${price ? `<p><strong>From ${seoHtmlEscape(price)}</strong></p>` : ""}
    <p><a href="/excursions/${encodeURIComponent(slug)}">View excursion details</a></p></article>`;
}
function seoInitialStyles() {
  return `<style id="seo-initial-style">
  #seo-initial-content{max-width:1180px;margin:0 auto;padding:32px 20px 56px;color:#18212b;font-family:Arial,sans-serif;line-height:1.65}
  #seo-initial-content h1{font-size:clamp(2rem,4vw,3rem);line-height:1.15;margin:0 0 16px}
  #seo-initial-content h2{font-size:1.35rem;margin:22px 0 8px}
  #seo-initial-content a{color:#08757d;text-decoration:underline}
  #seo-initial-content .seo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:24px}
  #seo-initial-content .seo-tour-card{background:#fff;border:1px solid #e6e7e8;border-radius:14px;padding:16px}
  #seo-initial-content .seo-muted{color:#58636f}
  #seo-initial-content .seo-list{padding-left:22px}
  </style>`;
}
function seoUpsertMeta(html, kind, key, value) {
  const pattern = new RegExp("<meta\\s+" + kind + '="' + key + '"[^>]*>', "i");
  const tag = `<meta ${kind}="${seoHtmlEscape(key)}" content="${seoHtmlEscape(value)}" />`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace("</head>", `${tag}</head>`);
}
async function renderKemetSpiritPublicHtml(pathname, template) {
  const path2 = pathname.replace(/\/+$/, "") || "/";
  const origin = "https://kemetspirit.com";
  let title = "KemetSpirit | Boat Trips, Island Tours & Safaris";
  let description = "Discover boat trips, island experiences, snorkeling, diving and desert safaris across Egypt. Compare tour details and book with confidence.";
  let body = "";
  let noindex = false;
  let nofollow = false;
  let statusCode = 200;
  let pageKind = "not-found";
  let tours = [];
  let currentTour = null;
  let currentBlogPost = null;
  let activeDestination = null;
  let destinationTours = [];
  let currentHighlights = [];
  let currentInclusions = [];
  let currentExclusions = [];
  let currentItinerary = [];
  let pageImage = `${origin}/logo.webp`;
  let visibleDestinations = [];
  let seoEntityType = "page";
  let seoIdentifier = "home";
  let seoIdentifierIsPageSlug = true;
  if (path2 === "/" || path2 === "/excursions") {
    const [publishedTours, allDestinations] = await Promise.all([
      loadKemetSpiritTours(),
      loadKemetSpiritDestinations()
    ]);
    tours = publishedTours;
    const publishedDestinationIds = new Set(
      tours.map((tour) => tour.destination_id).filter(Boolean).map(String)
    );
    visibleDestinations = allDestinations.filter((destination) => publishedDestinationIds.has(String(destination.id)));
  }
  if (path2 === "/") {
    pageKind = "home";
    const cards = tours.slice(0, 6).map(seoTourCard).filter(Boolean).join("");
    body = `<main id="seo-initial-content"><h1>Explore Egypt\u2019s Boat Trips, Island Tours & Safaris</h1>
      <p>Discover the excursions currently published on KemetSpirit. Compare available boat trips, island experiences, snorkeling activities and other Red Sea tours using the individual excursion details.</p>
      <h2>Explore destinations</h2>
      <div class="seo-grid">${(visibleDestinations || []).map(seoDestinationCard).filter(Boolean).join("")}</div>
      <h2>Explore published excursions</h2><p><a href="/excursions">Browse all excursions</a></p>
      <div class="seo-grid">${cards || "<p>Explore the excursions catalogue for currently published experiences and details.</p>"}</div>
      <h2>About KemetSpirit</h2><p>Explore our <a href="/about">about page</a>, learn about <a href="/booking-conditions">booking terms and conditions</a>, or <a href="/contact">contact our Hurghada team</a>.</p>
      <p>Phone: <a href="tel:+201515212741">+20 151 5212741</a></p></main>`;
  } else if (path2 === "/experiences") {
    pageKind = "experiences";
    seoIdentifier = "experiences";
    title = "Red Sea Experiences & Excursion Categories | KemetSpirit";
    description = "Discover boat trips, island escapes, snorkeling, diving and desert adventures across Egypt\u2019s Red Sea coast.";
    let categories = [];
    if (publicSupabase) {
      try {
        const { data, error } = await publicSupabase.from("categories").select("name,slug,description").eq("status", "published").order("sort_order", { ascending: true });
        if (error) console.warn("[SEO render] Published experience categories unavailable:", error.message);
        categories = Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn("[SEO render] Experience category query failed:", error);
      }
    }
    const cards = categories.map((category) => {
      const name = seoPlainText(category.name, 120);
      const summary = seoPlainText(category.description, 400);
      return name ? `<article class="seo-tour-card"><h2>${seoHtmlEscape(name)}</h2>${summary ? `<p>${seoHtmlEscape(summary)}</p>` : ""}</article>` : "";
    }).filter(Boolean).join("");
    body = `<main id="seo-initial-content"><nav><a href="/">Home</a> / Experiences</nav>
      <h1>Explore Experiences on Egypt\u2019s Red Sea Coast</h1>
      <p>Choose from published excursion categories, from island and boat trips to snorkeling, diving and desert adventures. Explore current tours and review each itinerary before booking.</p>
      <div class="seo-grid">${cards || "<p>Experience categories are being updated. Please browse our published excursions.</p>"}</div>
      <p><a href="/excursions">Browse all excursions</a></p></main>`;
  } else if (path2 === "/excursions") {
    pageKind = "catalogue";
    title = "Boat Trips & Island Tours in Egypt | KemetSpirit";
    description = "Browse boat trips, island experiences, snorkeling activities and desert adventures across Egypt. Compare durations, inclusions and prices.";
    const cards = tours.map(seoTourCard).filter(Boolean).join("");
    body = `<main id="seo-initial-content"><nav><a href="/">Home</a> / Excursions</nav>
      <h1>Boat Trips & Island Tours in Egypt</h1>
      <p>Browse the excursions currently published on KemetSpirit. Review each tour\u2019s description, duration, price and booking details.</p>
      <div class="seo-grid">${cards || "<p>There are currently no published excursions to display.</p>"}</div>
      <h2>Explore by destination</h2>
      <div class="seo-grid">${(visibleDestinations || []).map(seoDestinationCard).filter(Boolean).join("")}</div></main>`;
  } else if (path2.startsWith("/excursions/")) {
    let slug = "";
    try {
      slug = decodeURIComponent(path2.slice("/excursions/".length));
    } catch {
      slug = "";
    }
    if (publicSupabase && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
      try {
        const { data, error } = await publicSupabase.from("tours").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
        if (error) console.warn("[SEO render] Tour detail unavailable:", error.message);
        currentTour = data || null;
      } catch (error) {
        console.warn("[SEO render] Tour detail query failed:", error);
      }
    }
    if (currentTour) {
      pageKind = "tour";
      seoEntityType = "tour";
      seoIdentifier = String(currentTour.id);
      seoIdentifierIsPageSlug = false;
      title = `${seoPlainText(currentTour.title, 160)} | KemetSpirit`;
      const summary = seoPlainText(currentTour.short_description || currentTour.description, 300);
      description = summary || `Review details and booking information for ${seoPlainText(currentTour.title, 160)}.`;
      const relationQueries = await Promise.all([
        publicSupabase.from("tour_images").select("image_url,alt_text,is_primary").eq("tour_id", currentTour.id).order("sort_order", { ascending: true }),
        publicSupabase.from("tour_highlights").select("item").eq("tour_id", currentTour.id).order("sort_order", { ascending: true }),
        publicSupabase.from("tour_inclusions").select("item").eq("tour_id", currentTour.id).order("sort_order", { ascending: true }),
        publicSupabase.from("tour_exclusions").select("item").eq("tour_id", currentTour.id).order("sort_order", { ascending: true }),
        publicSupabase.from("tour_itinerary").select("time,title,description").eq("tour_id", currentTour.id).order("sort_order", { ascending: true })
      ]);
      const tourImages = relationQueries[0].error ? [] : relationQueries[0].data || [];
      const primaryImage = tourImages.find((image) => image.is_primary) || tourImages[0];
      pageImage = seoSafeImage(primaryImage?.image_url) || pageImage;
      currentHighlights = relationQueries[1].error ? [] : relationQueries[1].data || [];
      currentInclusions = relationQueries[2].error ? [] : relationQueries[2].data || [];
      currentExclusions = relationQueries[3].error ? [] : relationQueries[3].data || [];
      currentItinerary = relationQueries[4].error ? [] : relationQueries[4].data || [];
      const price = seoPrice(currentTour.price, currentTour.currency);
      const duration = seoPlainText(currentTour.duration, 100);
      const list = (heading, rows) => rows.length ? `<section><h2>${heading}</h2><ul class="seo-list">${rows.map((row) => `<li>${seoHtmlEscape(seoPlainText(row.item || row.title, 400))}</li>`).join("")}</ul></section>` : "";
      const itinerary = currentItinerary.length ? `<section><h2>Itinerary</h2><ol class="seo-list">${currentItinerary.map((row) => `<li><strong>${seoHtmlEscape(seoPlainText(row.time, 40))} ${seoHtmlEscape(seoPlainText(row.title, 180))}</strong> ${seoHtmlEscape(seoPlainText(row.description, 400))}</li>`).join("")}</ol></section>` : "";
      body = `<main id="seo-initial-content"><nav><a href="/">Home</a> / <a href="/excursions">Excursions</a></nav><article>
        <h1>${seoHtmlEscape(seoPlainText(currentTour.title, 160))}</h1>
        ${pageImage !== `${origin}/logo.webp` ? `<figure><img src="${seoHtmlEscape(pageImage)}" alt="${seoHtmlEscape(seoPlainText(currentTour.title, 160))}" loading="eager" style="width:100%;max-height:420px;object-fit:cover;border-radius:14px" /></figure>` : ""}
        ${summary ? `<p>${seoHtmlEscape(summary)}</p>` : ""}
        ${price ? `<p><strong>Starting price: ${seoHtmlEscape(price)}</strong></p>` : ""}
        ${duration ? `<p>Duration: ${seoHtmlEscape(duration)}</p>` : ""}
        ${currentTour.description ? `<section><h2>About this excursion</h2><p>${seoHtmlEscape(seoPlainText(currentTour.description, 4e3))}</p></section>` : ""}
        ${list("Highlights", currentHighlights)}${itinerary}${list("Included", currentInclusions)}${list("Not included", currentExclusions)}
        ${currentTour.pickup_info ? `<section><h2>Pickup and departure</h2><p>${seoHtmlEscape(seoPlainText(currentTour.pickup_info, 1e3))}</p></section>` : ""}
        ${currentTour.cancellation_policy ? `<section><h2>Cancellation information</h2><p>${seoHtmlEscape(seoPlainText(currentTour.cancellation_policy, 1e3))}</p></section>` : ""}
        <p><a href="/booking?tour=${encodeURIComponent(slug)}">Continue to booking</a></p>
      </article></main>`;
    }
  } else if (path2 === "/blog") {
    pageKind = "blog-index";
    seoEntityType = "page";
    seoIdentifier = "blog";
    seoIdentifierIsPageSlug = true;
    title = "KemetSpirit Travel Journal | Red Sea Guides & Egypt Travel Stories";
    description = "Discover Red Sea travel guides, local insights and inspiration for exploring Hurghada and Egypt with KemetSpirit.";
    if (publicSupabase) {
      try {
        const { data, error } = await publicSupabase.from("blog_posts").select("title,slug,excerpt,cover_image_url,published_at,blog_categories(name)").in("status", ["published", "scheduled"]).lte("published_at", (/* @__PURE__ */ new Date()).toISOString()).order("published_at", { ascending: false }).limit(30);
        if (error) console.warn("[SEO render] Blog index query failed:", error.message);
        const posts = data || [];
        const cards = posts.map((post) => {
          const slug = typeof post.slug === "string" ? post.slug.trim() : "";
          const postTitle = seoPlainText(post.title, 160);
          if (!postTitle || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) return "";
          const excerpt = seoPlainText(post.excerpt, 400);
          const image = seoSafeImage(post.cover_image_url);
          if (!pageImage || pageImage === `${origin}/logo.webp`) pageImage = image || pageImage;
          return `<article class="seo-tour-card">${image ? `<img src="${seoHtmlEscape(image)}" alt="${seoHtmlEscape(postTitle)}" loading="lazy" style="width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:10px;margin-bottom:12px" />` : ""}<p class="seo-muted">${seoHtmlEscape(seoPlainText(post.blog_categories?.name, 80) || "Travel guide")}</p><h2><a href="/blog/${encodeURIComponent(slug)}">${seoHtmlEscape(postTitle)}</a></h2>${excerpt ? `<p>${seoHtmlEscape(excerpt)}</p>` : ""}<p><a href="/blog/${encodeURIComponent(slug)}">Read story</a></p></article>`;
        }).filter(Boolean).join("");
        body = `<main id="seo-initial-content"><nav><a href="/">Home</a> / Travel Journal</nav><h1>The KemetSpirit Travel Journal</h1><p>${seoHtmlEscape(description)}</p><div class="seo-grid">${cards || "<p>New travel guides and local stories are on their way.</p>"}</div></main>`;
      } catch (error) {
        console.warn("[SEO render] Blog index render failed:", error);
      }
    }
  } else if (path2.startsWith("/blog/")) {
    let slug = "";
    try {
      slug = decodeURIComponent(path2.slice("/blog/".length));
    } catch {
      slug = "";
    }
    if (publicSupabase && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
      try {
        const { data, error } = await publicSupabase.from("blog_posts").select("title,slug,excerpt,content,cover_image_url,author_name,seo_title,seo_description,published_at,updated_at,blog_categories(name)").eq("slug", slug).in("status", ["published", "scheduled"]).lte("published_at", (/* @__PURE__ */ new Date()).toISOString()).maybeSingle();
        if (error) console.warn("[SEO render] Blog article lookup failed:", error.message);
        currentBlogPost = data || null;
      } catch (error) {
        console.warn("[SEO render] Blog article query failed:", error);
      }
    }
    if (currentBlogPost) {
      pageKind = "blog";
      seoEntityType = "page";
      seoIdentifier = String(currentBlogPost.slug);
      seoIdentifierIsPageSlug = true;
      title = seoPlainText(currentBlogPost.seo_title, 180) || `${seoPlainText(currentBlogPost.title, 160)} | KemetSpirit Journal`;
      description = seoPlainText(currentBlogPost.seo_description || currentBlogPost.excerpt, 300) || "Travel inspiration and local guides from KemetSpirit in Hurghada, Egypt.";
      pageImage = seoSafeImage(currentBlogPost.cover_image_url) || pageImage;
      const contentLines = String(currentBlogPost.content || "").split(/\r?\n/);
      const blocks = [];
      let paragraph = [];
      let listItems = [];
      const flushParagraph = () => {
        if (paragraph.length) {
          blocks.push(`<p>${paragraph.map((line) => seoHtmlEscape(seoPlainText(line, 2e3))).join(" ")}</p>`);
          paragraph = [];
        }
      };
      const flushList = () => {
        if (listItems.length) {
          blocks.push(`<ul class="seo-list">${listItems.map((item) => `<li>${seoHtmlEscape(seoPlainText(item, 500))}</li>`).join("")}</ul>`);
          listItems = [];
        }
      };
      for (const rawLine of contentLines) {
        const line = rawLine.trim();
        if (!line) {
          flushParagraph();
          flushList();
          continue;
        }
        const heading = line.match(/^#{1,3}\s+(.+)$/);
        const bullet = line.match(/^[-*]\s+(.+)$/);
        if (heading) {
          flushParagraph();
          flushList();
          blocks.push(`<h2>${seoHtmlEscape(seoPlainText(heading[1], 180))}</h2>`);
        } else if (bullet) {
          flushParagraph();
          listItems.push(bullet[1]);
        } else {
          flushList();
          paragraph.push(line);
        }
      }
      flushParagraph();
      flushList();
      body = `<main id="seo-initial-content"><nav><a href="/">Home</a> / <a href="/blog">Travel Journal</a> / ${seoHtmlEscape(seoPlainText(currentBlogPost.title, 160))}</nav><article><h1>${seoHtmlEscape(seoPlainText(currentBlogPost.title, 160))}</h1>${pageImage !== `${origin}/logo.webp` ? `<figure><img src="${seoHtmlEscape(pageImage)}" alt="${seoHtmlEscape(seoPlainText(currentBlogPost.title, 160))}" loading="eager" style="width:100%;max-height:520px;object-fit:cover;border-radius:14px" /></figure>` : ""}<p class="seo-muted">${seoHtmlEscape(seoPlainText(currentBlogPost.blog_categories?.name, 80) || "KemetSpirit Journal")} \xB7 ${seoHtmlEscape(seoPlainText(currentBlogPost.author_name, 120) || "KemetSpirit Editorial Team")}</p>${currentBlogPost.excerpt ? `<p><strong>${seoHtmlEscape(seoPlainText(currentBlogPost.excerpt, 600))}</strong></p>` : ""}${blocks.join("")}<p><a href="/excursions">Explore KemetSpirit excursions</a></p></article></main>`;
    }
  } else if (path2.startsWith("/destinations/")) {
    let slug = "";
    try {
      slug = decodeURIComponent(path2.slice("/destinations/".length));
    } catch {
      slug = "";
    }
    if (publicSupabase && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) {
      try {
        const { data, error } = await publicSupabase.from("destinations").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
        if (error) console.warn("[SEO render] Destination lookup failed:", error.message);
        activeDestination = data || null;
      } catch (error) {
        console.warn("[SEO render] Destination query failed:", error);
      }
    }
    if (activeDestination && publicSupabase) {
      try {
        const { data, error } = await publicSupabase.from("tours").select("*").eq("destination_id", activeDestination.id).eq("status", "published").order("sort_order", { ascending: true }).limit(100);
        if (error) console.warn("[SEO render] Destination tours query failed:", error.message);
        destinationTours = Array.isArray(data) ? data : [];
      } catch (error) {
        console.warn("[SEO render] Destination tours query exception:", error);
      }
    }
    if (activeDestination && destinationTours.length > 0) {
      pageKind = "destination";
      seoEntityType = "destination";
      seoIdentifier = String(activeDestination.id);
      seoIdentifierIsPageSlug = false;
      title = seoPlainText(activeDestination.seo_title, 180) || `${seoPlainText(activeDestination.name, 120)} Excursions & Activities | KemetSpirit`;
      const destinationDescription = seoPlainText(activeDestination.description, 4e3);
      const destinationTagline = seoPlainText(activeDestination.tagline, 500);
      description = seoPlainText(activeDestination.seo_description || destinationDescription || destinationTagline, 300);
      noindex = destinationTours.length < 2 && destinationDescription.length + destinationTagline.length < 300;
      pageImage = seoSafeImage(activeDestination.main_image) || pageImage;
      const cards = destinationTours.map(seoTourCard).filter(Boolean).join("");
      body = `<main id="seo-initial-content"><nav><a href="/">Home</a> / <a href="/excursions">Excursions</a> / ${seoHtmlEscape(seoPlainText(activeDestination.name, 120))}</nav>
        <article><h1>Excursions in ${seoHtmlEscape(seoPlainText(activeDestination.name, 120))}</h1>
        ${activeDestination.tagline ? `<p><strong>${seoHtmlEscape(seoPlainText(activeDestination.tagline, 300))}</strong></p>` : ""}
        ${description ? `<p>${seoHtmlEscape(description)}</p>` : ""}
        <h2>Published excursions in ${seoHtmlEscape(seoPlainText(activeDestination.name, 120))}</h2>
        <div class="seo-grid">${cards}</div></article></main>`;
    }
  } else {
    const pages = await loadKemetSpiritPages();
    const page = pages.find((item) => item && item.slug === path2.slice(1));
    if (page) {
      pageKind = "static";
      seoIdentifier = String(page.slug);
      seoIdentifierIsPageSlug = true;
      title = seoPlainText(page.seoTitle, 180) || `${seoPlainText(page.title, 160)} | KemetSpirit`;
      description = seoPlainText(page.seoDescription, 300) || seoPlainText(page.heroSubtitle, 300);
      noindex = page.seoIndexable === false;
      nofollow = noindex;
      const sections = Array.isArray(page.sections) ? page.sections.map((section) => {
        const h = seoPlainText(section?.title, 180);
        const p = seoPlainText(section?.content, 3e3);
        return `<section>${h ? `<h2>${seoHtmlEscape(h)}</h2>` : ""}${p ? `<p>${seoHtmlEscape(p)}</p>` : ""}</section>`;
      }).join("") : "";
      body = `<main id="seo-initial-content"><nav><a href="/">Home</a> / ${seoHtmlEscape(seoPlainText(page.title, 160))}</nav>
        <article><h1>${seoHtmlEscape(seoPlainText(page.heroHeadline, 240) || seoPlainText(page.title, 160))}</h1>
        ${page.heroSubtitle ? `<p>${seoHtmlEscape(seoPlainText(page.heroSubtitle, 1e3))}</p>` : ""}${sections}</article></main>`;
    }
  }
  if (pageKind === "not-found") {
    statusCode = 404;
    noindex = true;
    nofollow = true;
    title = "Page Not Found | KemetSpirit";
    description = "The requested page could not be found.";
    body = `<main id="seo-initial-content"><h1>Page not found</h1><p>The requested page is not available.</p><p><a href="/">Return to the homepage</a> or <a href="/excursions">browse excursions</a>.</p></main>`;
  }
  if (pageKind !== "not-found") {
    const override = await loadKemetSpiritSeoOverride(seoEntityType, seoIdentifier, seoIdentifierIsPageSlug);
    if (override?.seo_title) title = seoPlainText(override.seo_title, 180);
    if (override?.meta_description) description = seoPlainText(override.meta_description, 300);
    if (override?.og_image) pageImage = seoSafeImage(override.og_image) || pageImage;
    if (override?.robots_index === false) noindex = true;
    if (override?.robots_follow === false) nofollow = true;
  }
  const canonical = `${origin}${path2 === "/" ? "/" : path2}`;
  const cmsSocialProfiles = [];
  if (publicSupabase) {
    try {
      const { data, error } = await publicSupabase.from("site_settings").select("value").eq("key", "social_links").maybeSingle();
      if (!error && data?.value && typeof data.value === "object") {
        const social = data.value;
        for (const key of ["facebook", "instagram", "youtube", "tiktok", "tripadvisor"]) {
          if (typeof social[key] === "string") cmsSocialProfiles.push(social[key]);
        }
      }
    } catch (error) {
      console.warn("[SEO schema] Social profile settings unavailable:", error);
    }
  }
  const configuredSameAs = [
    ...(process.env.BRAND_SAME_AS_URLS || "").split(","),
    ...cmsSocialProfiles
  ].map((value) => value.trim()).filter((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && [
        "facebook.com",
        "www.facebook.com",
        "instagram.com",
        "www.instagram.com",
        "linkedin.com",
        "www.linkedin.com",
        "youtube.com",
        "www.youtube.com",
        "tiktok.com",
        "www.tiktok.com",
        "tripadvisor.com",
        "www.tripadvisor.com",
        "x.com",
        "www.x.com"
      ].includes(url.hostname.toLowerCase());
    } catch {
      return false;
    }
  });
  const organization = {
    "@type": ["TravelAgency", "Organization"],
    "@id": `${origin}/#organization`,
    name: "KemetSpirit",
    url: origin,
    logo: `${origin}/logo.webp`,
    description: "Excursions and experiences along Egypt\u2019s Red Sea coast, based in Hurghada, Egypt.",
    telephone: "+201515212741",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hurghada New Marina, Berth B-14",
      addressLocality: "Hurghada",
      addressRegion: "Red Sea Governorate",
      addressCountry: "EG"
    },
    contactPoint: [{
      "@type": "ContactPoint",
      telephone: "+201515212741",
      contactType: "customer service",
      availableLanguage: ["English", "German", "Russian"],
      url: `${origin}/contact`
    }]
  };
  if (configuredSameAs.length) organization.sameAs = Array.from(new Set(configuredSameAs));
  const graph = [
    organization,
    { "@type": "WebSite", "@id": `${origin}/#website`, url: origin, name: "KemetSpirit", publisher: { "@id": `${origin}/#organization` }, inLanguage: "en" }
  ];
  if (pageKind === "tour" && currentTour) {
    const price = Number(currentTour.price);
    const currency = typeof currentTour.currency === "string" && /^[A-Z]{3}$/i.test(currentTour.currency) ? currentTour.currency.toUpperCase() : "EUR";
    graph.push({
      "@type": "TouristTrip",
      "@id": `${canonical}#touristtrip`,
      name: seoPlainText(currentTour.title, 160),
      description,
      url: canonical,
      image: pageImage !== `${origin}/logo.webp` ? [pageImage] : void 0,
      provider: { "@id": `${origin}/#organization` },
      ...Number.isFinite(price) && price > 0 ? {
        subjectOf: {
          "@type": "Product",
          name: seoPlainText(currentTour.title, 160),
          offers: { "@type": "Offer", url: canonical, price, priceCurrency: currency, seller: { "@id": `${origin}/#organization` } }
        }
      } : {}
    });
  } else if (pageKind === "blog" && currentBlogPost) {
    graph.push({
      "@type": "BlogPosting",
      "@id": `${canonical}#blogposting`,
      headline: seoPlainText(currentBlogPost.title, 160),
      description,
      url: canonical,
      image: pageImage !== `${origin}/logo.webp` ? [pageImage] : void 0,
      datePublished: currentBlogPost.published_at,
      dateModified: currentBlogPost.updated_at || currentBlogPost.published_at,
      author: { "@type": "Organization", name: seoPlainText(currentBlogPost.author_name, 120) || "KemetSpirit Editorial Team" },
      publisher: { "@id": `${origin}/#organization` },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      isPartOf: { "@id": `${origin}/#website` }
    });
  } else if (pageKind === "destination" && activeDestination) {
    const destinationItems = destinationTours.map((tour, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: seoPlainText(tour.title, 160),
      url: `${origin}/excursions/${encodeURIComponent(String(tour.slug || ""))}`
    })).filter((item) => item.name && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(item.url.split("/").pop() || ""));
    graph.push({
      "@type": "TouristDestination",
      "@id": `${canonical}#destination`,
      name: seoPlainText(activeDestination.name, 120),
      description,
      url: canonical,
      image: pageImage !== `${origin}/logo.webp` ? pageImage : void 0,
      subjectOf: { "@type": "ItemList", itemListElement: destinationItems }
    });
  } else {
    graph.push({
      "@type": pageKind === "catalogue" || pageKind === "experiences" || pageKind === "home" || pageKind === "blog-index" ? "CollectionPage" : "WebPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      isPartOf: { "@id": `${origin}/#website` }
    });
  }
  const schema = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${seoHtmlEscape(title)}</title>`);
  html = seoUpsertMeta(html, "name", "description", description);
  html = seoUpsertMeta(html, "name", "robots", noindex ? `noindex, ${nofollow ? "nofollow" : "follow"}` : "index, follow, max-image-preview:large");
  html = seoUpsertMeta(html, "property", "og:title", title);
  html = seoUpsertMeta(html, "property", "og:description", description);
  html = seoUpsertMeta(html, "property", "og:site_name", "KemetSpirit");
  html = seoUpsertMeta(html, "property", "og:type", pageKind === "tour" ? "product" : pageKind === "blog" ? "article" : "website");
  html = seoUpsertMeta(html, "property", "og:url", canonical);
  html = seoUpsertMeta(html, "property", "og:image", pageImage);
  html = seoUpsertMeta(html, "name", "twitter:card", "summary_large_image");
  html = seoUpsertMeta(html, "name", "twitter:title", title);
  html = seoUpsertMeta(html, "name", "twitter:description", description);
  html = seoUpsertMeta(html, "name", "twitter:image", pageImage);
  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${seoHtmlEscape(canonical)}" />`);
  html = html.replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, "");
  html = html.replace("</head>", `<script type="application/ld+json">${schema}</script>${seoInitialStyles()}</head>`);
  html = html.replace(/<div id="root"><\/div>/i, `<div id="root">${body}</div>`);
  return { html, statusCode, noindex, nofollow };
}
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    const indexHtmlPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexHtmlPath)) {
      console.warn(`WARNING: Production build not found at ${distPath}. Running "npm run build" is required for production.`);
    }
    app.use(
      express.static(distPath, {
        index: false,
        maxAge: "1h",
        setHeaders: (res, filePath) => {
          if (filePath.endsWith("sw.js") || filePath.endsWith("manifest.webmanifest")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          } else if (filePath.includes("/assets/")) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          }
        }
      })
    );
    app.get("/", async (req, res, next) => {
      res.setHeader(
        "Link",
        '<https://kemetspirit.com/llms.txt>; rel="alternate"; type="text/plain"; title="KemetSpirit LLMs index", <https://kemetspirit.com/sitemap.xml>; rel="sitemap"'
      );
      const acceptsMarkdown = (req.get("accept") || "").split(",").some((value) => value.trim().toLowerCase().startsWith("text/markdown"));
      if (!acceptsMarkdown) return next();
      const tours = await loadKemetSpiritTours();
      const lines = [
        "# KemetSpirit",
        "",
        "Explore published excursions and experiences along Egypt\u2019s Red Sea coast.",
        "",
        "## Main pages",
        "- Homepage: https://kemetspirit.com/",
        "- Excursions catalogue: https://kemetspirit.com/excursions",
        "- About: https://kemetspirit.com/about",
        "- Contact: https://kemetspirit.com/contact",
        "- Booking terms: https://kemetspirit.com/booking-conditions",
        "- Full agent index: https://kemetspirit.com/llms.txt",
        "",
        "## Contact",
        "- Phone: +20 151 5212741",
        "- Office: Hurghada New Marina, Berth B-14, Red Sea, Egypt",
        "",
        "## Published excursions"
      ];
      for (const tour of tours) {
        const slug = typeof tour.slug === "string" ? tour.slug.trim() : "";
        const title = cleanPublicText(tour.title, 160);
        if (!title || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)) continue;
        const summary = cleanPublicText(tour.short_description || tour.description, 300);
        lines.push(`- [${title}](https://kemetspirit.com/excursions/${encodeURIComponent(slug)}): ${summary}`);
      }
      res.status(200);
      res.type("text/markdown; charset=utf-8");
      res.setHeader("Vary", "Accept");
      res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=60");
      return res.send(lines.join("\\n"));
    });
    app.get("*", async (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ success: false, error: "API route not found" });
      }
      if (!fs.existsSync(indexHtmlPath)) {
        return res.status(503).send("KemetSpirit production assets are not available.");
      }
      const privateRoute = /^\/(?:admin(?:\/|$)|booking(?:\/|$)|my-booking(?:\/|$)|login(?:\/|$)|register(?:\/|$)|account(?:\/|$)|profile(?:\/|$)|reset-password(?:\/|$)|support(?:\/|$))/i;
      if (privateRoute.test(req.path)) {
        return res.sendFile(indexHtmlPath);
      }
      try {
        const indexHtml = fs.readFileSync(indexHtmlPath, "utf8");
        const rendered = await renderKemetSpiritPublicHtml(req.path, indexHtml);
        res.status(rendered.statusCode);
        res.type("html");
        if (rendered.noindex) {
          res.setHeader("X-Robots-Tag", `noindex, ${rendered.nofollow ? "nofollow" : "follow"}`);
        }
        res.setHeader("Cache-Control", rendered.statusCode === 200 ? "public, max-age=30, s-maxage=60, stale-while-revalidate=30" : "no-store");
        return res.send(rendered.html);
      } catch (error) {
        console.error("[Public SEO render] Failed to render route:", req.path, error);
        res.setHeader("Cache-Control", "no-store");
        return res.sendFile(indexHtmlPath);
      }
    });
  }
  let stopBookingNotificationWorker = null;
  const server = app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`KemetSpirit server running on port/socket ${PORT} [${process.env.NODE_ENV || "development"}]`);
    void pruneVisitorAnalytics();
    const visitorRetentionTimer = setInterval(() => {
      void pruneVisitorAnalytics();
    }, 24 * 60 * 60 * 1e3);
    visitorRetentionTimer.unref();
    if (process.env.NODE_ENV === "production" && serverSupabase && SUPABASE_KEY_TYPE === "service_role") {
      stopBookingNotificationWorker = startBookingNotificationWorker(serverSupabase);
    } else if (process.env.NODE_ENV === "production") {
      console.warn("[Booking Notification Worker] Not started: a valid server-side Supabase secret key is required.");
    }
  });
  const shutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    stopBookingNotificationWorker?.();
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forceful shutdown timeout.");
      process.exit(1);
    }, 5e3).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
if (!process.env.VERCEL) {
  startServer();
}
var server_default = app;
export {
  app,
  server_default as default,
  isSupabasePublishableKey,
  isSupabaseSecretKey
};
