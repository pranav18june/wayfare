export interface FlightQuery {
  from: string; // Airport code e.g. "DEL"
  to: string;   // Airport code e.g. "BOM"
  date: string; // "YYYY-MM-DD"
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabin?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS";
}

export interface FlightResult {
  id: string;
  flightNumber: string;
  airlineCode: string;
  airlineName: string;
  fromCode: string;
  toCode: string;
  departTime: string;
  arriveTime: string;
  durationMin: number;
  stops: number;
  baseFare: number;
  calculatedFare: number;
  baggage: string;
  refundable: boolean;
  aircraft?: string | null;
  seatsLeft: number;
}

export interface DayFare {
  date: string; // YYYY-MM-DD
  minFare: number;
  available: boolean;
}

export interface TrainQuery {
  fromStation: string; // e.g. "NDLS"
  toStation: string;   // e.g. "BCT"
  date: string;        // "YYYY-MM-DD"
  classCode?: string;  // e.g. "3A", "SL", "ALL"
  quota?: string;      // "GN", "TQ", "LD"
}

export interface TrainClassAvailability {
  classCode: string;
  fare: number;
  status: "AVL" | "RAC" | "WL" | "REGRET";
  count: number;
  probabilityPercent?: number;
  probabilityRating?: "HIGH" | "MEDIUM" | "LOW";
}

export interface TrainResult {
  trainNumber: string;
  trainName: string;
  trainType: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  runningDays: number; // Bitmask or days array
  classes: TrainClassAvailability[];
}

export interface PNRPassengerStatus {
  name: string;
  bookingStatus: string; // e.g. "W/L 12, GN"
  currentStatus: string; // e.g. "CNF" or "RAC 4"
  coach?: string;
  berth?: string;
  berthType?: string; // "Lower", "Side Lower", etc.
}

export interface PNRStatusResult {
  pnr: string;
  trainNumber: string;
  trainName: string;
  date: string;
  fromStation: string;
  toStation: string;
  boardingStation: string;
  reservationClass: string;
  chartPrepared: boolean;
  passengers: PNRPassengerStatus[];
}

export interface StationLiveStatus {
  stationCode: string;
  stationName: string;
  scheduledArrival: string | null;
  scheduledDeparture: string | null;
  expectedArrival: string | null;
  expectedDeparture: string | null;
  delayMins: number;
  dayOffset: number;
  distanceKm: number;
  haltMins: number;
  status: "DEPARTED" | "CURRENT" | "UPCOMING";
}

export interface LiveRunningStatusResult {
  trainNumber: string;
  trainName: string;
  runDate: string;
  lastUpdated: string;
  currentStationCode: string;
  currentStationName: string;
  overallDelayMins: number;
  isDelayed: boolean;
  timeline: StationLiveStatus[];
}

export interface TrainScheduleStop {
  seq: number;
  stationCode: string;
  stationName: string;
  arrival: string | null;
  departure: string | null;
  haltMins: number;
  distanceKm: number;
  dayOffset: number;
}

export interface TrainScheduleResult {
  trainNumber: string;
  trainName: string;
  trainType: string;
  runsOnBitmask: number;
  stops: TrainScheduleStop[];
}

export interface BusQuery {
  fromCity: string;
  toCity: string;
  date: string; // YYYY-MM-DD
}

export interface BusSeat {
  id: string; // e.g. "L1" or "U4"
  deck: "LOWER" | "UPPER";
  row: number;
  col: number;
  type: "SLEEPER" | "SEATER";
  ladiesOnly: boolean;
  price: number;
  isBooked: boolean;
}

export interface BusResult {
  id: string;
  operatorName: string;
  operatorCode: string;
  busType: string;
  fromCity: string;
  toCity: string;
  departTime: string;
  arriveTime: string;
  baseFare: number;
  rating: number;
  seatsLeft: number;
  boardingPoints: { name: string; time: string }[];
  droppingPoints: { name: string; time: string }[];
}

export interface HotelQuery {
  city: string;
  checkIn: string;  // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests?: number;
  rooms?: number;
}

export interface HotelResult {
  id: string;
  name: string;
  city: string;
  locality: string;
  stars: number;
  rating: number;
  amenities: string[];
  startingPrice: number;
  freeCancellation: boolean;
  images: string[];
}

export interface HotelRoomDetail {
  id: string;
  type: string;
  capacity: number;
  basePrice: number;
  available: boolean;
}

export interface HotelDetailResult {
  id: string;
  name: string;
  city: string;
  locality: string;
  stars: number;
  rating: number;
  amenities: string[];
  description: string;
  images: string[];
  policies: {
    checkIn: string;
    checkOut: string;
    cancellationHours: number;
    freeCancellation: boolean;
  };
  rooms: HotelRoomDetail[];
  reviews: {
    author: string;
    rating: number;
    text: string;
    date: string;
  }[];
}
