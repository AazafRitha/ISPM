import mongoose from "mongoose";

const SimulationEventSchema = new mongoose.Schema({
  simulationName: { type: String, required: true },
  email: { type: String, required: true },
  eventType: {
    type: String,
    enum: ["email_sent", "link_clicked", "form_submitted", "simulation_launched"],
    required: true,
  },
  metadata: { type: Object },
  timestamp: { type: Date, default: Date.now },
});

const SimulationEvent = mongoose.model("SimulationEvent", SimulationEventSchema);
export default SimulationEvent;
