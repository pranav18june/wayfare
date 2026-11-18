import { MockFlightProvider, FlightProvider } from "./flightProvider";
import { MockTrainProvider, TrainProvider } from "./trainProvider";
import { MockBusProvider, BusProvider } from "./busProvider";
import { MockHotelProvider, HotelProvider } from "./hotelProvider";

export * from "./types";
export * from "./flightProvider";
export * from "./trainProvider";
export * from "./busProvider";
export * from "./hotelProvider";

// Singleton provider factory based on PROVIDER_MODE environment variable
export const flightProvider: FlightProvider = new MockFlightProvider();
export const trainProvider: TrainProvider = new MockTrainProvider();
export const busProvider: BusProvider = new MockBusProvider();
export const hotelProvider: HotelProvider = new MockHotelProvider();
