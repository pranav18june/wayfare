import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Seeded PRNG (Mulberry32) for deterministic reproducible data
function createRng(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createRng(42);

function randInt(min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randChoice<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

async function main() {
  console.log("Seeding Wayfare travel platform database...");

  // 1. Clear existing records safely
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingPassenger.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.checkoutSession.deleteMany();
  await prisma.priceAlert.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.recentSearch.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.savedTraveller.deleteMany();
  await prisma.user.deleteMany();
  await prisma.promoCode.deleteMany();

  await prisma.flightInstance.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.airline.deleteMany();
  await prisma.airport.deleteMany();

  await prisma.trainAvailability.deleteMany();
  await prisma.trainClassFare.deleteMany();
  await prisma.trainStop.deleteMany();
  await prisma.train.deleteMany();
  await prisma.station.deleteMany();

  await prisma.busPoint.deleteMany();
  await prisma.busInstance.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.busOperator.deleteMany();

  await prisma.hotelReview.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.city.deleteMany();

  // 2. Demo Users
  console.log("Creating demo users...");
  const salt = await bcrypt.genSalt(10);
  const travellerHash = await bcrypt.hash("Demo1234!", salt);
  const adminHash = await bcrypt.hash("Admin1234!", salt);
  const newHash = await bcrypt.hash("New1234!", salt);

  const travellerUser = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "traveller@demo.test",
      passwordHash: travellerHash,
      phone: "+91 98765 43210",
      role: "TRAVELLER",
      walletBalance: 4500,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: "Wayfare Admin",
      email: "admin@demo.test",
      passwordHash: adminHash,
      phone: "+91 99999 11111",
      role: "ADMIN",
      walletBalance: 10000,
    },
  });

  const newUser = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "new@demo.test",
      passwordHash: newHash,
      phone: "+91 91234 56789",
      role: "TRAVELLER",
      walletBalance: 500,
    },
  });

  // Saved travellers for travellerUser
  await prisma.savedTraveller.createMany({
    data: [
      {
        userId: travellerUser.id,
        name: "Aarav Sharma",
        dob: new Date("1992-06-15"),
        gender: "M",
        idType: "AADHAAR",
        idNumber: "XXXXXXXX4321",
        nationality: "IN",
        berthPreference: "LOWER",
      },
      {
        userId: travellerUser.id,
        name: "Meera Sharma",
        dob: new Date("1995-11-23"),
        gender: "F",
        idType: "AADHAAR",
        idNumber: "XXXXXXXX8899",
        nationality: "IN",
        berthPreference: "SIDE_LOWER",
      },
      {
        userId: travellerUser.id,
        name: "Rohan Sharma",
        dob: new Date("2021-04-10"),
        gender: "M",
        idType: "BIRTH_CERTIFICATE",
        idNumber: "BC20210410",
        nationality: "IN",
        berthPreference: "LOWER",
      },
    ],
  });

  // Wallet initial transactions
  await prisma.walletTransaction.createMany({
    data: [
      {
        userId: travellerUser.id,
        type: "CREDIT",
        amount: 5000,
        ref: "Initial Deposit / Welcome Credit",
      },
      {
        userId: travellerUser.id,
        type: "DEBIT",
        amount: 500,
        ref: "Convenience Fee Adjustment",
      },
      {
        userId: newUser.id,
        type: "CREDIT",
        amount: 500,
        ref: "Sign-up Bonus",
      },
    ],
  });

  // Promo codes
  console.log("Creating promo codes...");
  await prisma.promoCode.createMany({
    data: [
      {
        code: "WAYFARE10",
        type: "PERCENTAGE",
        value: 10,
        minAmount: 1500,
        maxDiscount: 1000,
        modes: JSON.stringify(["FLIGHT", "TRAIN", "BUS", "HOTEL"]),
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2027-12-31"),
        usageLimit: 10000,
        usedCount: 142,
      },
      {
        code: "FLYSAFE",
        type: "FLAT",
        value: 500,
        minAmount: 3000,
        maxDiscount: 500,
        modes: JSON.stringify(["FLIGHT"]),
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2027-12-31"),
        usageLimit: 5000,
        usedCount: 88,
      },
      {
        code: "RAIL20",
        type: "PERCENTAGE",
        value: 20,
        minAmount: 800,
        maxDiscount: 300,
        modes: JSON.stringify(["TRAIN"]),
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2027-12-31"),
        usageLimit: 8000,
        usedCount: 210,
      },
      {
        code: "BUS50",
        type: "FLAT",
        value: 150,
        minAmount: 600,
        maxDiscount: 150,
        modes: JSON.stringify(["BUS"]),
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2027-12-31"),
        usageLimit: 3000,
        usedCount: 45,
      },
      {
        code: "STAYHOTEL",
        type: "PERCENTAGE",
        value: 15,
        minAmount: 2000,
        maxDiscount: 1500,
        modes: JSON.stringify(["HOTEL"]),
        validFrom: new Date("2024-01-01"),
        validTo: new Date("2027-12-31"),
        usageLimit: 4000,
        usedCount: 33,
      },
    ],
  });

  // 3. Geographic Data: Cities, Airports, Stations
  console.log("Creating transit geography...");
  const cityData = [
    { name: "New Delhi", state: "Delhi" },
    { name: "Mumbai", state: "Maharashtra" },
    { name: "Bengaluru", state: "Karnataka" },
    { name: "Chennai", state: "Tamil Nadu" },
    { name: "Kolkata", state: "West Bengal" },
    { name: "Hyderabad", state: "Telangana" },
    { name: "Ahmedabad", state: "Gujarat" },
    { name: "Pune", state: "Maharashtra" },
    { name: "Goa", state: "Goa" },
    { name: "Jaipur", state: "Rajasthan" },
    { name: "Kochi", state: "Kerala" },
    { name: "Lucknow", state: "Uttar Pradesh" },
    { name: "Varanasi", state: "Uttar Pradesh" },
    { name: "Chandigarh", state: "Punjab" },
    { name: "Bhopal", state: "Madhya Pradesh" },
    { name: "Indore", state: "Madhya Pradesh" },
    { name: "Patna", state: "Bihar" },
    { name: "Nagpur", state: "Maharashtra" },
    { name: "Surat", state: "Gujarat" },
    { name: "Visakhapatnam", state: "Andhra Pradesh" },
    { name: "Guwahati", state: "Assam" },
    { name: "Bhubaneswar", state: "Odisha" },
    { name: "Coimbatore", state: "Tamil Nadu" },
    { name: "Amritsar", state: "Punjab" },
    { name: "Udaipur", state: "Rajasthan" },
    { name: "Agra", state: "Uttar Pradesh" },
    { name: "Dehradun", state: "Uttarakhand" },
    { name: "Shimla", state: "Himachal Pradesh" },
    { name: "Mysuru", state: "Karnataka" },
    { name: "Madurai", state: "Tamil Nadu" },
    { name: "Mangaluru", state: "Karnataka" },
    { name: "Thiruvananthapuram", state: "Kerala" },
    { name: "Ranchi", state: "Jharkhand" },
    { name: "Raipur", state: "Chhattisgarh" },
    { name: "Jodhpur", state: "Rajasthan" },
    { name: "Vadodara", state: "Gujarat" },
    { name: "Jammu", state: "Jammu and Kashmir" },
    { name: "Srinagar", state: "Jammu and Kashmir" },
    { name: "Gwalior", state: "Madhya Pradesh" },
    { name: "Tirupati", state: "Andhra Pradesh" },
  ];

  const cityMap = new Map<string, string>();
  for (const c of cityData) {
    const created = await prisma.city.create({
      data: c,
    });
    cityMap.set(c.name, created.id);
  }

  // Airports (~40 Indian airports)
  const airportList = [
    { code: "DEL", name: "Indira Gandhi International Airport", city: "New Delhi" },
    { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai" },
    { code: "BLR", name: "Kempegowda International Airport", city: "Bengaluru" },
    { code: "MAA", name: "Chennai International Airport", city: "Chennai" },
    { code: "CCU", name: "Netaji Subhash Chandra Bose International Airport", city: "Kolkata" },
    { code: "HYD", name: "Rajiv Gandhi International Airport", city: "Hyderabad" },
    { code: "AMD", name: "Sardar Vallabhbhai Patel International Airport", city: "Ahmedabad" },
    { code: "PNQ", name: "Pune Airport", city: "Pune" },
    { code: "GOI", name: "Dabolim Airport", city: "Goa" },
    { code: "JAI", name: "Jaipur International Airport", city: "Jaipur" },
    { code: "COK", name: "Cochin International Airport", city: "Kochi" },
    { code: "LKO", name: "Chaudhary Charan Singh International Airport", city: "Lucknow" },
    { code: "VNS", name: "Lal Bahadur Shastri International Airport", city: "Varanasi" },
    { code: "IXC", name: "Chandigarh International Airport", city: "Chandigarh" },
    { code: "BHO", name: "Raja Bhoj Airport", city: "Bhopal" },
    { code: "IDR", name: "Devi Ahilyabai Holkar Airport", city: "Indore" },
    { code: "PAT", name: "Jay Prakash Narayan Airport", city: "Patna" },
    { code: "NAG", name: "Dr. Babasaheb Ambedkar International Airport", city: "Nagpur" },
    { code: "STV", name: "Surat Airport", city: "Surat" },
    { code: "VTZ", name: "Visakhapatnam Airport", city: "Visakhapatnam" },
    { code: "GAU", name: "Lokpriya Gopinath Bordoloi International Airport", city: "Guwahati" },
    { code: "BBI", name: "Biju Patnaik International Airport", city: "Bhubaneswar" },
    { code: "CJB", name: "Coimbatore International Airport", city: "Coimbatore" },
    { code: "ATQ", name: "Sri Guru Ram Dass Jee International Airport", city: "Amritsar" },
    { code: "UDR", name: "Maharana Pratap Airport", city: "Udaipur" },
    { code: "AGR", name: "Agra Airport", city: "Agra" },
    { code: "DED", name: "Dehradun Airport", city: "Dehradun" },
    { code: "TRV", name: "Trivandrum International Airport", city: "Thiruvananthapuram" },
    { code: "IXE", name: "Mangaluru International Airport", city: "Mangaluru" },
    { code: "IXR", name: "Birsa Munda Airport", city: "Ranchi" },
    { code: "RPR", name: "Swami Vivekananda Airport", city: "Raipur" },
    { code: "JDH", name: "Jodhpur Airport", city: "Jodhpur" },
    { code: "BDQ", name: "Vadodara Airport", city: "Vadodara" },
    { code: "IXJ", name: "Jammu Airport", city: "Jammu" },
    { code: "SXR", name: "Sheikh ul-Alam International Airport", city: "Srinagar" },
    { code: "GWL", name: "Gwalior Airport", city: "Gwalior" },
    { code: "TIR", name: "Tirupati Airport", city: "Tirupati" },
    { code: "IXZ", name: "Veer Savarkar International Airport", city: "Port Blair" },
    { code: "MYQ", name: "Mysore Airport", city: "Mysuru" },
    { code: "IXM", name: "Madurai Airport", city: "Madurai" },
  ];

  await prisma.airport.createMany({
    data: airportList.map((a) => ({ ...a, country: "IN" })),
  });

  // 12 Fictional Airlines (as specified in requirements)
  const airlineList = [
    { code: "SL", name: "Skyline Air" },
    { code: "DW", name: "Deccan Wings" },
    { code: "PJ", name: "PeakJet" },
    { code: "BC", name: "BlueCrest Air" },
    { code: "CE", name: "Coastal Express" },
    { code: "SA", name: "Summit Airways" },
    { code: "EA", name: "Eastern Air" },
    { code: "WW", name: "Western Wings" },
    { code: "MA", name: "Meridian Air" },
    { code: "HA", name: "Horizon Airlines" },
    { code: "AA", name: "Apex Air" },
    { code: "SW", name: "Swift Air" },
  ];

  const airlineMap = new Map<string, string>();
  for (const al of airlineList) {
    const created = await prisma.airline.create({
      data: al,
    });
    airlineMap.set(al.code, created.id);
  }

  // Generate Flight Schedule and Instances (>= 600 flights across top 30 city pairs, 30 days ahead)
  console.log("Generating flights and date instances...");
  const topAirports = ["DEL", "BOM", "BLR", "MAA", "CCU", "HYD", "AMD", "PNQ", "GOI", "COK", "JAI", "LKO"];
  const flightPairs: { from: string; to: string }[] = [];
  for (let i = 0; i < topAirports.length; i++) {
    for (let j = 0; j < topAirports.length; j++) {
      if (i !== j) {
        flightPairs.push({ from: topAirports[i], to: topAirports[j] });
      }
    }
  }

  const aircraftTypes = ["Airbus A320neo", "Boeing 737 MAX", "Airbus A321neo", "Boeing 787-8"];
  const baggageOptions = [
    "15 kg Check-in, 7 kg Cabin",
    "20 kg Check-in, 7 kg Cabin",
    "25 kg Check-in, 8 kg Cabin",
  ];

  const createdFlights: { id: string; fromCode: string; toCode: string; baseFare: number }[] = [];
  let flightNumberSeq = 100;

  for (const pair of flightPairs) {
    // 2-3 daily flight options per pair
    const count = randInt(2, 3);
    for (let k = 0; k < count; k++) {
      flightNumberSeq++;
      const airlineCode = randChoice(airlineList).code;
      const airlineId = airlineMap.get(airlineCode)!;
      const departHour = 5 + Math.floor(rng() * 17); // 5 AM to 10 PM
      const departMin = Math.floor(rng() * 12) * 5;
      const dur = randInt(75, 180);
      const arriveMins = departHour * 60 + departMin + dur;
      const stops = rng() > 0.8 ? 1 : 0;
      const base = randInt(3200, 7800);

      const f = await prisma.flight.create({
        data: {
          airlineId,
          number: `${airlineCode}-${flightNumberSeq}`,
          fromCode: pair.from,
          toCode: pair.to,
          departTime: `${departHour.toString().padStart(2, "0")}:${departMin.toString().padStart(2, "0")}`,
          arriveTime: formatMinutes(arriveMins),
          durationMin: dur + (stops ? 45 : 0),
          stops,
          baseFare: base,
          baggage: randChoice(baggageOptions),
          refundable: rng() > 0.5,
          aircraft: randChoice(aircraftTypes),
        },
      });
      createdFlights.push({ id: f.id, fromCode: pair.from, toCode: pair.to, baseFare: base });
    }
  }

  // Generate 30 days of FlightInstances with dynamic pricing
  const today = new Date();
  const dateStrings: string[] = [];
  for (let d = 0; d < 30; d++) {
    const dt = new Date(today.getTime() + d * 86400000);
    dateStrings.push(dt.toISOString().slice(0, 10));
  }

  const flightInstancesBatch: {
    flightId: string;
    date: string;
    seatsLeft: number;
    priceMultiplier: number;
  }[] = [];

  for (const f of createdFlights) {
    for (let dayIndex = 0; dayIndex < 30; dayIndex++) {
      const dateStr = dateStrings[dayIndex];
      // Dynamic pricing factors:
      // days-to-departure factor: closer to date = higher multiplier
      const daysToDepartFactor = dayIndex < 3 ? 1.4 : dayIndex < 7 ? 1.2 : dayIndex > 20 ? 0.9 : 1.0;
      // day-of-week factor: weekends (Fri/Sun) higher
      const dt = new Date(dateStr);
      const dow = dt.getDay();
      const dowFactor = dow === 0 || dow === 5 ? 1.15 : dow === 6 ? 1.08 : 0.98;
      // Scarcity factor
      const seats = randInt(4, 85);
      const scarcityFactor = seats < 10 ? 1.3 : seats < 25 ? 1.1 : 1.0;

      const multiplier = Math.round(daysToDepartFactor * dowFactor * scarcityFactor * 100) / 100;
      flightInstancesBatch.push({
        flightId: f.id,
        date: dateStr,
        seatsLeft: seats,
        priceMultiplier: multiplier,
      });
    }
  }

  // Insert flight instances in chunks of 500
  for (let i = 0; i < flightInstancesBatch.length; i += 500) {
    const chunk = flightInstancesBatch.slice(i, i + 500);
    await prisma.flightInstance.createMany({
      data: chunk,
    });
  }

  // 4. Stations and Trains (Signature Module)
  console.log("Creating Indian Railways network (stations & multi-stop schedules)...");
  const stationList = [
    { code: "NDLS", name: "New Delhi", city: "New Delhi", state: "Delhi" },
    { code: "BCT", name: "Mumbai Central", city: "Mumbai", state: "Maharashtra" },
    { code: "CSMT", name: "Chhatrapati Shivaji Maharaj Terminus", city: "Mumbai", state: "Maharashtra" },
    { code: "HWH", name: "Howrah Junction", city: "Kolkata", state: "West Bengal" },
    { code: "SBC", name: "KSR Bengaluru City Junction", city: "Bengaluru", state: "Karnataka" },
    { code: "MAS", name: "MGR Chennai Central", city: "Chennai", state: "Tamil Nadu" },
    { code: "SC", name: "Secunderabad Junction", city: "Hyderabad", state: "Telangana" },
    { code: "ADI", name: "Ahmedabad Junction", city: "Ahmedabad", state: "Gujarat" },
    { code: "PUNE", name: "Pune Junction", city: "Pune", state: "Maharashtra" },
    { code: "LKO", name: "Lucknow Charbagh", city: "Lucknow", state: "Uttar Pradesh" },
    { code: "BSB", name: "Varanasi Junction", city: "Varanasi", state: "Uttar Pradesh" },
    { code: "JP", name: "Jaipur Junction", city: "Jaipur", state: "Rajasthan" },
    { code: "CNB", name: "Kanpur Central", city: "Kanpur", state: "Uttar Pradesh" },
    { code: "BPL", name: "Bhopal Junction", city: "Bhopal", state: "Madhya Pradesh" },
    { code: "NGP", name: "Nagpur Junction", city: "Nagpur", state: "Maharashtra" },
    { code: "PNBE", name: "Patna Junction", city: "Patna", state: "Bihar" },
    { code: "GHY", name: "Guwahati Junction", city: "Guwahati", state: "Assam" },
    { code: "BBS", name: "Bhubaneswar", city: "Bhubaneswar", state: "Odisha" },
    { code: "ASR", name: "Amritsar Junction", city: "Amritsar", state: "Punjab" },
    { code: "CDG", name: "Chandigarh", city: "Chandigarh", state: "Punjab" },
    { code: "AGC", name: "Agra Cantt", city: "Agra", state: "Uttar Pradesh" },
    { code: "GWL", name: "Gwalior Junction", city: "Gwalior", state: "Madhya Pradesh" },
    { code: "JHS", name: "Virangana Lakshmibai Jhansi", city: "Jhansi", state: "Uttar Pradesh" },
    { code: "KOTA", name: "Kota Junction", city: "Kota", state: "Rajasthan" },
    { code: "BRC", name: "Vadodara Junction", city: "Vadodara", state: "Gujarat" },
    { code: "ST", name: "Surat", city: "Surat", state: "Gujarat" },
    { code: "RTM", name: "Ratlam Junction", city: "Ratlam", state: "Madhya Pradesh" },
    { code: "MAO", name: "Madgaon Junction", city: "Goa", state: "Goa" },
    { code: "ERS", name: "Ernakulam Junction", city: "Kochi", state: "Kerala" },
    { code: "TVC", name: "Thiruvananthapuram Central", city: "Thiruvananthapuram", state: "Kerala" },
    { code: "DLI", name: "Old Delhi Junction", city: "New Delhi", state: "Delhi" },
    { code: "NZM", name: "Hazrat Nizamuddin", city: "New Delhi", state: "Delhi" },
    { code: "ANVT", name: "Anand Vihar Terminal", city: "New Delhi", state: "Delhi" },
    { code: "BDTS", name: "Bandra Terminus", city: "Mumbai", state: "Maharashtra" },
    { code: "LTT", name: "Lokmanya Tilak Terminus", city: "Mumbai", state: "Maharashtra" },
    { code: "KGP", name: "Kharagpur Junction", city: "Kharagpur", state: "West Bengal" },
    { code: "MYS", name: "Mysuru Junction", city: "Mysuru", state: "Karnataka" },
    { code: "CBE", name: "Coimbatore Main", city: "Coimbatore", state: "Tamil Nadu" },
    { code: "MDU", name: "Madurai Junction", city: "Madurai", state: "Tamil Nadu" },
    { code: "VSKP", name: "Visakhapatnam Junction", city: "Visakhapatnam", state: "Andhra Pradesh" },
  ];

  await prisma.station.createMany({
    data: stationList,
  });

  // 12 Key Corridors with realistic stations
  const corridors = [
    {
      name: "Delhi-Mumbai Main Corridor",
      stations: ["NDLS", "KOTA", "RTM", "BRC", "ST", "BCT"],
      distances: [0, 465, 730, 990, 1120, 1385],
    },
    {
      name: "Delhi-Howrah Main Corridor",
      stations: ["NDLS", "CNB", "BSB", "PNBE", "HWH"],
      distances: [0, 440, 770, 995, 1450],
    },
    {
      name: "Mumbai-Bengaluru Corridor",
      stations: ["CSMT", "PUNE", "SBC"],
      distances: [0, 192, 1025],
    },
    {
      name: "Chennai-Bengaluru Corridor",
      stations: ["MAS", "SBC", "MYS"],
      distances: [0, 360, 498],
    },
    {
      name: "Delhi-Lucknow Corridor",
      stations: ["NDLS", "CNB", "LKO"],
      distances: [0, 440, 515],
    },
    {
      name: "Mumbai-Goa Konkan Corridor",
      stations: ["CSMT", "PUNE", "MAO"],
      distances: [0, 192, 750],
    },
    {
      name: "Delhi-Amritsar Corridor",
      stations: ["NDLS", "CDG", "ASR"],
      distances: [0, 245, 450],
    },
    {
      name: "Delhi-Bhopal Corridor",
      stations: ["NDLS", "AGC", "GWL", "JHS", "BPL"],
      distances: [0, 195, 315, 410, 700],
    },
  ];

  // Specific iconic trains
  const premierTrains = [
    { number: "12952", name: "Mumbai Rajdhani Express", type: "RAJDHANI", corridor: corridors[0], depHour: 16, depMin: 55 },
    { number: "12951", name: "New Delhi Rajdhani Express", type: "RAJDHANI", corridor: corridors[0], depHour: 17, depMin: 0 },
    { number: "12302", name: "Howrah Rajdhani Express", type: "RAJDHANI", corridor: corridors[1], depHour: 16, depMin: 50 },
    { number: "12301", name: "New Delhi Rajdhani (Via Gaya)", type: "RAJDHANI", corridor: corridors[1], depHour: 16, depMin: 55 },
    { number: "12004", name: "Lucknow Swarna Shatabdi", type: "SHATABDI", corridor: corridors[4], depHour: 6, depMin: 10 },
    { number: "12002", name: "Bhopal Shatabdi Express", type: "SHATABDI", corridor: corridors[7], depHour: 6, depMin: 0 },
    { number: "12007", name: "Chennai Mysore Shatabdi", type: "SHATABDI", corridor: corridors[3], depHour: 6, depMin: 0 },
    { number: "12124", name: "Deccan Queen Express", type: "SUPERFAST", corridor: corridors[2], depHour: 7, depMin: 15 },
    { number: "12051", name: "Madgaon Jan Shatabdi", type: "SHATABDI", corridor: corridors[5], depHour: 5, depMin: 25 },
    { number: "12013", name: "Amritsar Shatabdi Express", type: "SHATABDI", corridor: corridors[6], depHour: 16, depMin: 30 },
  ];

  // Generate 120 total trains across corridors
  const trainTypes = ["RAJDHANI", "SHATABDI", "SUPERFAST", "EXPRESS", "DURONTO"];
  const allTrainConfigs: {
    number: string;
    name: string;
    type: string;
    corridor: (typeof corridors)[0];
    depHour: number;
    depMin: number;
  }[] = [...premierTrains];

  let trainNumCounter = 14000;
  while (allTrainConfigs.length < 120) {
    const cor = randChoice(corridors);
    const type = randChoice(trainTypes);
    const startStation = cor.stations[0];
    const endStation = cor.stations[cor.stations.length - 1];
    trainNumCounter++;
    allTrainConfigs.push({
      number: trainNumCounter.toString(),
      name: `${startStation}-${endStation} ${type === "SUPERFAST" ? "Superfast" : type === "EXPRESS" ? "Express" : type}`,
      type,
      corridor: cor,
      depHour: randInt(5, 22),
      depMin: Math.floor(rng() * 12) * 5,
    });
  }

  const trainClasses = ["1A", "2A", "3A", "SL", "CC", "2S"];
  const classFareRates: Record<string, number> = {
    "1A": 3.2,
    "2A": 2.1,
    "3A": 1.4,
    "CC": 1.2,
    "SL": 0.55,
    "2S": 0.28,
  };

  const trainAvailBatch: {
    trainNumber: string;
    date: string;
    classCode: string;
    quota: string;
    status: string;
    count: number;
  }[] = [];

  for (const tConfig of allTrainConfigs) {
    await prisma.train.create({
      data: {
        number: tConfig.number,
        name: tConfig.name,
        type: tConfig.type,
        runsOnBitmask: 127, // Runs every day
      },
    });

    // Create stops
    let currentMins = tConfig.depHour * 60 + tConfig.depMin;
    let dayOffset = 0;

    for (let sIdx = 0; sIdx < tConfig.corridor.stations.length; sIdx++) {
      const stationCode = tConfig.corridor.stations[sIdx];
      const dist = tConfig.corridor.distances[sIdx];
      const isFirst = sIdx === 0;
      const isLast = sIdx === tConfig.corridor.stations.length - 1;

      if (!isFirst) {
        // Average speed 70 km/h
        const distDiff = dist - tConfig.corridor.distances[sIdx - 1];
        const travelMins = Math.round((distDiff / 75) * 60);
        currentMins += travelMins;
        if (currentMins >= 1440) {
          dayOffset += Math.floor(currentMins / 1440);
          currentMins %= 1440;
        }
      }

      const arrivalTime = isFirst ? null : formatMinutes(currentMins);
      if (!isFirst && !isLast) {
        currentMins += randInt(5, 15); // Halt time
      }
      const departureTime = isLast ? null : formatMinutes(currentMins);

      await prisma.trainStop.create({
        data: {
          trainNumber: tConfig.number,
          stationCode,
          seq: sIdx + 1,
          arrival: arrivalTime,
          departure: departureTime,
          dayOffset,
          distanceKm: dist,
        },
      });
    }

    // Create Fares for station pairs along corridor
    const applicableClasses =
      tConfig.type === "SHATABDI"
        ? ["CC", "1A"]
        : tConfig.type === "RAJDHANI"
        ? ["1A", "2A", "3A"]
        : ["2A", "3A", "SL", "2S"];

    for (let i = 0; i < tConfig.corridor.stations.length; i++) {
      for (let j = i + 1; j < tConfig.corridor.stations.length; j++) {
        const fromStn = tConfig.corridor.stations[i];
        const toStn = tConfig.corridor.stations[j];
        const distKm = tConfig.corridor.distances[j] - tConfig.corridor.distances[i];

        for (const cls of applicableClasses) {
          const fare = Math.max(120, Math.round(distKm * (classFareRates[cls] || 1.0) + randInt(30, 80)));
          await prisma.trainClassFare.create({
            data: {
              trainNumber: tConfig.number,
              fromStation: fromStn,
              toStation: toStn,
              classCode: cls,
              fare,
            },
          });
        }
      }
    }

    // Availability for first 14 days
    for (let d = 0; d < 14; d++) {
      const dateStr = dateStrings[d];
      for (const cls of applicableClasses) {
        // Status distribution: 60% AVL, 25% RAC, 15% WL
        const roll = rng();
        let status = "AVL";
        let count = randInt(5, 60);
        if (roll > 0.85) {
          status = "WL";
          count = randInt(1, 24);
        } else if (roll > 0.6) {
          status = "RAC";
          count = randInt(1, 15);
        }

        trainAvailBatch.push({
          trainNumber: tConfig.number,
          date: dateStr,
          classCode: cls,
          quota: "GN",
          status,
          count,
        });

        // Tatkal Quota availability
        if (d <= 2) {
          trainAvailBatch.push({
            trainNumber: tConfig.number,
            date: dateStr,
            classCode: cls,
            quota: "TQ",
            status: rng() > 0.4 ? "AVL" : "WL",
            count: randInt(2, 12),
          });
        }
      }
    }
  }

  // Insert train availability in chunks
  for (let i = 0; i < trainAvailBatch.length; i += 500) {
    const chunk = trainAvailBatch.slice(i, i + 500);
    await prisma.trainAvailability.createMany({
      data: chunk,
    });
  }

  // 5. Buses and Operators
  console.log("Creating bus networks & operators...");
  const busOperators = [
    { code: "VRL", name: "VRL Travels" },
    { code: "SRS", name: "SRS Travels" },
    { code: "ZNG", name: "Zingbus Connect" },
    { code: "NEO", name: "Neeta Tours & Travels" },
    { code: "ORNG", name: "Orange Tours" },
    { code: "INTR", name: "IntrCity SmartBus" },
    { code: "KPN", name: "KPN Travels" },
    { code: "PTL", name: "Patel Travels" },
    { code: "HNS", name: "Hans Travels" },
    { code: "GJR", name: "Gujarat Travels" },
    { code: "SHR", name: "Sharma Transports" },
    { code: "PARK", name: "Parveen Travels" },
    { code: "RATH", name: "Rathimeena Travels" },
    { code: "ROY", name: "Royal Travels" },
    { code: "EAG", name: "Eagle Travels" },
    { code: "SRI", name: "Sri Krishna Travels" },
    { code: "KAV", name: "Kaveri Travels" },
    { code: "JAB", name: "Jabbar Travels" },
    { code: "MAH", name: "Mahasagar Travels" },
    { code: "BLU", name: "Bluecity Travels" },
  ];

  const operatorMap = new Map<string, string>();
  for (const op of busOperators) {
    const created = await prisma.busOperator.create({
      data: op,
    });
    operatorMap.set(op.code, created.id);
  }

  // Bus routes between major nearby city pairs
  const busCityPairs = [
    ["New Delhi", "Jaipur"],
    ["New Delhi", "Chandigarh"],
    ["New Delhi", "Agra"],
    ["New Delhi", "Dehradun"],
    ["New Delhi", "Amritsar"],
    ["New Delhi", "Lucknow"],
    ["Mumbai", "Pune"],
    ["Mumbai", "Goa"],
    ["Mumbai", "Surat"],
    ["Mumbai", "Ahmedabad"],
    ["Bengaluru", "Chennai"],
    ["Bengaluru", "Hyderabad"],
    ["Bengaluru", "Mysuru"],
    ["Bengaluru", "Goa"],
    ["Bengaluru", "Coimbatore"],
    ["Chennai", "Madurai"],
    ["Chennai", "Coimbatore"],
    ["Hyderabad", "Vijayawada"],
    ["Kolkata", "Bhubaneswar"],
    ["Pune", "Goa"],
  ];

  // Standard Sleeper Layout JSON (Lower + Upper deck)
  const defaultSeatLayout = JSON.stringify({
    decks: ["LOWER", "UPPER"],
    lower: [
      { id: "L1", row: 1, col: 1, type: "SLEEPER", ladies: false },
      { id: "L2", row: 1, col: 2, type: "SLEEPER", ladies: false },
      { id: "L3", row: 2, col: 1, type: "SLEEPER", ladies: true },
      { id: "L4", row: 2, col: 2, type: "SLEEPER", ladies: true },
      { id: "L5", row: 3, col: 1, type: "SLEEPER", ladies: false },
      { id: "L6", row: 3, col: 2, type: "SLEEPER", ladies: false },
      { id: "L7", row: 4, col: 1, type: "SLEEPER", ladies: false },
      { id: "L8", row: 4, col: 2, type: "SLEEPER", ladies: false },
      { id: "L9", row: 5, col: 1, type: "SLEEPER", ladies: false },
      { id: "L10", row: 5, col: 2, type: "SLEEPER", ladies: false },
    ],
    upper: [
      { id: "U1", row: 1, col: 1, type: "SLEEPER", ladies: false },
      { id: "U2", row: 1, col: 2, type: "SLEEPER", ladies: false },
      { id: "U3", row: 2, col: 1, type: "SLEEPER", ladies: true },
      { id: "U4", row: 2, col: 2, type: "SLEEPER", ladies: true },
      { id: "U5", row: 3, col: 1, type: "SLEEPER", ladies: false },
      { id: "U6", row: 3, col: 2, type: "SLEEPER", ladies: false },
      { id: "U7", row: 4, col: 1, type: "SLEEPER", ladies: false },
      { id: "U8", row: 4, col: 2, type: "SLEEPER", ladies: false },
      { id: "U9", row: 5, col: 1, type: "SLEEPER", ladies: false },
      { id: "U10", row: 5, col: 2, type: "SLEEPER", ladies: false },
    ],
  });

  const busTypes = [
    "AC Sleeper (2+1)",
    "Volvo Multi-Axle AC Sleeper",
    "BharatBenz AC Seater (2+2)",
    "Scania AC Semi-Sleeper",
    "Non-AC Sleeper (2+1)",
  ];

  let busCount = 0;
  for (const pair of busCityPairs) {
    const fromId = cityMap.get(pair[0]);
    const toId = cityMap.get(pair[1]);
    if (!fromId || !toId) continue;

    // Both directions
    for (const [fCityId, tCityId, fName, tName] of [
      [fromId, toId, pair[0], pair[1]],
      [toId, fromId, pair[1], pair[0]],
    ]) {
      // 5 buses per corridor
      for (let b = 0; b < 5; b++) {
        busCount++;
        const op = randChoice(busOperators);
        const opId = operatorMap.get(op.code)!;
        const depH = randInt(18, 23); // Night buses mostly
        const depM = Math.floor(rng() * 12) * 5;
        const durHours = randInt(5, 11);
        const arrMins = (depH * 60 + depM + durHours * 60) % 1440;
        const basePrice = randInt(650, 1850);

        const createdBus = await prisma.bus.create({
          data: {
            operatorId: opId,
            type: randChoice(busTypes),
            fromCityId: fCityId,
            toCityId: tCityId,
            departTime: `${depH.toString().padStart(2, "0")}:${depM.toString().padStart(2, "0")}`,
            arriveTime: formatMinutes(arrMins),
            baseFare: basePrice,
            rating: Math.round((3.8 + rng() * 1.1) * 10) / 10,
            layoutJson: defaultSeatLayout,
          },
        });

        // Boarding & Dropping points
        await prisma.busPoint.createMany({
          data: [
            { busId: createdBus.id, type: "BOARDING", name: `${fName} Central Bus Station`, time: createdBus.departTime },
            { busId: createdBus.id, type: "BOARDING", name: `${fName} Outer Ring Rd Toll Plaza`, time: formatMinutes((depH * 60 + depM + 30) % 1440) },
            { busId: createdBus.id, type: "DROPPING", name: `${tName} Bypass Junction`, time: formatMinutes((arrMins - 25 + 1440) % 1440) },
            { busId: createdBus.id, type: "DROPPING", name: `${tName} City Terminal`, time: createdBus.arriveTime },
          ],
        });

        // Seed 14 days of instances with booked seats
        for (let d = 0; d < 14; d++) {
          const bookedCount = randInt(2, 9);
          const allSeatIds = ["L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9", "L10", "U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "U9", "U10"];
          const booked: string[] = [];
          for (let k = 0; k < bookedCount; k++) {
            const seat = randChoice(allSeatIds);
            if (!booked.includes(seat)) booked.push(seat);
          }

          await prisma.busInstance.create({
            data: {
              busId: createdBus.id,
              date: dateStrings[d],
              bookedSeats: JSON.stringify(booked),
            },
          });
        }
      }
    }
  }

  // 6. Hotels & Rooms (~150 hotels across 25 cities)
  console.log("Creating hotels, room inventories, and reviews...");
  const hotelAmenitiesList = [
    "High-speed WiFi",
    "Swimming Pool",
    "Complimentary Breakfast",
    "Central AC",
    "24/7 Room Service",
    "Fitness Center",
    "Valet Parking",
    "Spa & Wellness",
    "Airport Shuttle",
    "Business Center",
  ];

  const hotelChains = [
    "Grand Heritage",
    "Regency Comfort",
    "Palace View",
    "Ginger Leaf",
    "Royal Residency",
    "Citadel Premier",
    "Park Suites",
    "Fern Green",
  ];

  let hotelCounter = 0;
  for (const [cityName, cityId] of Array.from(cityMap.entries())) {
    if (hotelCounter >= 150) break;
    // 5-7 hotels per city
    const count = randInt(5, 7);
    for (let h = 0; h < count; h++) {
      hotelCounter++;
      const chain = randChoice(hotelChains);
      const stars = randChoice([3, 4, 5]);
      const rating = Math.round((3.9 + rng() * 1.0) * 10) / 10;
      const amenities = hotelAmenitiesList.filter(() => rng() > 0.35);

      const createdHotel = await prisma.hotel.create({
        data: {
          name: `${chain} ${cityName}`,
          cityId,
          locality: `City Center, ${cityName}`,
          stars,
          rating,
          amenities: JSON.stringify(amenities),
          description: `Experience exceptional hospitality at ${chain} ${cityName}. Centrally situated with modern rooms, fine dining, and seamless connectivity to major transit hubs.`,
          images: JSON.stringify([
            "/img/hotels/room-1.jpg",
            "/img/hotels/room-2.jpg",
            "/img/hotels/lobby.jpg",
            "/img/hotels/dining.jpg",
          ]),
          policies: JSON.stringify({
            checkIn: "14:00",
            checkOut: "11:00",
            cancellationHours: 24,
            freeCancellation: stars >= 4,
          }),
        },
      });

      // 3-4 Room Types
      const roomTypes = [
        { type: "Deluxe Queen Room", capacity: 2, price: stars * 1100 + randInt(200, 600) },
        { type: "Executive King Room", capacity: 2, price: stars * 1500 + randInt(400, 900) },
        { type: "Family Suite with Balcony", capacity: 4, price: stars * 2200 + randInt(600, 1400) },
      ];

      for (const rt of roomTypes) {
        await prisma.room.create({
          data: {
            hotelId: createdHotel.id,
            type: rt.type,
            capacity: rt.capacity,
            basePrice: rt.price,
            inventoryPerDay: randInt(4, 15),
          },
        });
      }

      // 3-5 Reviews
      const reviewAuthors = ["Vikram Malhotra", "Sunita Rao", "Karthik N.", "Ananya Sen", "Rajesh Goyal"];
      for (let r = 0; r < randInt(3, 5); r++) {
        await prisma.hotelReview.create({
          data: {
            hotelId: createdHotel.id,
            author: reviewAuthors[r % reviewAuthors.length],
            rating: Math.round((4.0 + rng() * 1.0) * 10) / 10,
            text: `Clean and comfortable stay. Staff was courteous and the breakfast buffet was great. Good location.`,
            date: new Date(Date.now() - randInt(2, 60) * 86400000),
          },
        });
      }
    }
  }

  // 7. Seed Sample Bookings for traveller@demo.test across all 4 modes & statuses
  console.log("Creating sample bookings across modes for demo users...");
  const sampleTrip = await prisma.trip.create({
    data: {
      userId: travellerUser.id,
      name: "Mumbai Business & Leisure Trip",
    },
  });

  // Flight Booking (Upcoming)
  const flightBooking = await prisma.booking.create({
    data: {
      userId: travellerUser.id,
      mode: "FLIGHT",
      status: "CONFIRMED",
      pnr: "WF98234123",
      totalAmount: 5490,
      taxes: 620,
      fees: 250,
      discount: 500,
      promoCode: "FLYSAFE",
      tripId: sampleTrip.id,
      metadataJson: JSON.stringify({
        origin: "DEL",
        destination: "BOM",
        flightNumber: "SL-102",
        date: dateStrings[4],
        departTime: "06:15",
        arriveTime: "08:30",
        airline: "Skyline Air",
      }),
    },
  });

  await prisma.bookingPassenger.create({
    data: {
      bookingId: flightBooking.id,
      name: "Aarav Sharma",
      age: 32,
      gender: "M",
      seat: "12F",
      ticketStatus: "CNF",
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: flightBooking.id,
      method: "UPI",
      status: "SUCCESS",
      gatewayRef: "UPI_WF_20261118_01",
      amount: 5490,
      scenario: "success",
    },
  });

  // Train Booking (Upcoming with RAC/WL checkability)
  const trainBooking = await prisma.booking.create({
    data: {
      userId: travellerUser.id,
      mode: "TRAIN",
      status: "CONFIRMED",
      pnr: "2489102934", // Checkable 10-digit PNR!
      totalAmount: 2420,
      taxes: 120,
      fees: 100,
      discount: 200,
      promoCode: "RAIL20",
      tripId: sampleTrip.id,
      metadataJson: JSON.stringify({
        trainNumber: "12952",
        trainName: "Mumbai Rajdhani Express",
        fromStation: "NDLS",
        toStation: "BCT",
        date: dateStrings[6],
        classCode: "3A",
        coach: "B3",
        berth: "42 (Lower)",
      }),
    },
  });

  await prisma.bookingPassenger.create({
    data: {
      bookingId: trainBooking.id,
      name: "Aarav Sharma",
      age: 32,
      gender: "M",
      seat: "B3-42",
      berth: "Lower",
      ticketStatus: "CNF",
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: trainBooking.id,
      method: "CARD",
      status: "SUCCESS",
      gatewayRef: "CARD_WF_20261118_02",
      amount: 2420,
      scenario: "success",
    },
  });

  // Bus Booking (Completed)
  const busBooking = await prisma.booking.create({
    data: {
      userId: travellerUser.id,
      mode: "BUS",
      status: "COMPLETED",
      pnr: "BUS8492019",
      totalAmount: 1250,
      taxes: 65,
      fees: 50,
      discount: 0,
      metadataJson: JSON.stringify({
        operator: "Zingbus Connect",
        from: "New Delhi",
        to: "Jaipur",
        date: "2026-11-10",
        seat: "L4",
      }),
    },
  });

  await prisma.bookingPassenger.create({
    data: {
      bookingId: busBooking.id,
      name: "Aarav Sharma",
      age: 32,
      gender: "M",
      seat: "L4",
      ticketStatus: "CNF",
    },
  });

  // Hotel Booking (Cancelled with Refund previewed and credited to wallet)
  const hotelBooking = await prisma.booking.create({
    data: {
      userId: travellerUser.id,
      mode: "HOTEL",
      status: "CANCELLED",
      pnr: "HTL4920192",
      totalAmount: 4800,
      taxes: 450,
      fees: 150,
      discount: 0,
      metadataJson: JSON.stringify({
        hotelName: "Grand Heritage Mumbai",
        roomType: "Executive King Room",
        checkIn: "2026-11-20",
        checkOut: "2026-11-22",
      }),
    },
  });

  await prisma.refund.create({
    data: {
      bookingId: hotelBooking.id,
      amount: 4800,
      destination: "WALLET",
      status: "COMPLETED",
      computedFromPolicy: "Full refund: Cancelled > 48h prior to standard 14:00 check-in.",
    },
  });

  // Price Alert
  await prisma.priceAlert.create({
    data: {
      userId: travellerUser.id,
      mode: "FLIGHT",
      routeJson: JSON.stringify({ from: "DEL", to: "BOM", date: dateStrings[5] }),
      targetPrice: 3800,
      status: "ACTIVE",
    },
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: travellerUser.id,
        type: "BOOKING",
        title: "Booking Confirmed: SL-102 DEL -> BOM",
        body: "Your flight SL-102 on " + dateStrings[4] + " is confirmed. PNR: WF98234123.",
      },
      {
        userId: travellerUser.id,
        type: "TRAIN_DELAY",
        title: "Train Alert: 12952 Mumbai Rajdhani",
        body: "Mumbai Rajdhani is running on time from New Delhi.",
      },
      {
        userId: travellerUser.id,
        type: "WALLET",
        title: "Refund Credited to Wallet",
        body: "₹4,800 has been credited to your Wayfare Wallet for cancelled booking HTL4920192.",
      },
    ],
  });

  // Recent searches
  await prisma.recentSearch.createMany({
    data: [
      {
        userId: travellerUser.id,
        mode: "FLIGHT",
        paramsJson: JSON.stringify({ from: "DEL", to: "BOM", date: dateStrings[4], cabin: "ECONOMY", adults: 1 }),
      },
      {
        userId: travellerUser.id,
        mode: "TRAIN",
        paramsJson: JSON.stringify({ from: "NDLS", to: "BCT", date: dateStrings[6], class: "3A", quota: "GN" }),
      },
      {
        userId: travellerUser.id,
        mode: "HOTEL",
        paramsJson: JSON.stringify({ city: "Mumbai", checkIn: dateStrings[4], checkOut: dateStrings[6], guests: 2 }),
      },
    ],
  });

  // Price history points for DEL-BOM and BLR-HYD (last 30 days)
  console.log("Generating price history for trend graphs...");
  for (let d = 30; d >= 0; d--) {
    const histDate = new Date(today.getTime() - d * 86400000).toISOString().slice(0, 10);
    await prisma.priceHistory.createMany({
      data: [
        {
          mode: "FLIGHT",
          routeKey: "DEL-BOM",
          date: histDate,
          minPrice: Math.round(3400 + Math.sin(d / 4) * 600 + (30 - d) * 20),
        },
        {
          mode: "BUS",
          routeKey: "New Delhi-Jaipur",
          date: histDate,
          minPrice: Math.round(650 + (d % 7 === 0 || d % 7 === 6 ? 150 : 0)),
        },
      ],
    });
  }

  console.log("Seeding complete! Database ready for demo.");
}

main()
  .catch((e) => {
    console.error("Error in seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
