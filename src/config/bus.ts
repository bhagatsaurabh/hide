import { CommandMap } from "@/models/context-menu";
import { createNanoEvents } from "nanoevents";

const bus = createNanoEvents<CommandMap>();
export default bus;
