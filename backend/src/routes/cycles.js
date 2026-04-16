import express from "express"
import { authenticate, authorize } from "../middleware/auth.js"
import CycleData from "../models/CycleData.js"

const router = express.Router()

const LOOKBACK_N = 3
const LUTEAL_DAYS = 14
const FERTILITY_MARGIN = 2

router.post("/", authenticate, authorize("patient"), async (req, res, next) => {
  try {
    const { startDate, endDate, flowLevel, symptoms } = req.body

    if (!startDate) {
      return res.status(400).json({ error: "Start date required" })
    }

    // Validation: End date cannot be before start date
    if (endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ error: "End date cannot be before start date" })
    }

    if (flowLevel && !["light", "medium", "heavy"].includes(flowLevel)) {
      return res.status(400).json({ error: "Invalid flow level" })
    }

    const existingCycle = await CycleData.findOne({
      patientId: req.user.userId,
      startDate: { $lte: new Date(startDate) },
      endDate: { $gte: new Date(startDate) },
    })

    if (existingCycle) {
      return res.status(409).json({ error: "Cycle already exists for this date range" })
    }

    const cycle = new CycleData({
      patientId: req.user.userId,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      flowLevel: flowLevel || null,
      symptoms: symptoms || [],
    })

    await cycle.save()
    res.status(201).json(cycle)
  } catch (error) {
    next(error)
  }
})

router.get("/", authenticate, authorize("patient"), async (req, res, next) => {
  try {
    const cycles = await CycleData.find({ patientId: req.user.userId }).sort({ startDate: -1 })
    res.json(cycles)
  } catch (error) {
    next(error)
  }
})

router.get("/stats", authenticate, authorize("patient"), async (req, res, next) => {
  try {
    const cycles = await CycleData.find({ patientId: req.user.userId }).sort({ startDate: -1 }).limit(12)

    if (cycles.length === 0) {
      return res.status(400).json({ error: "Insufficient cycle data" })
    }

    const cycleLengths = []
    for (let i = 0; i < cycles.length - 1; i++) {
      const length = Math.floor((cycles[i].startDate - cycles[i + 1].startDate) / (1000 * 60 * 60 * 24))
      if (length > 0) cycleLengths.push(length)
    }

    const periodLengths = []
    cycles.forEach((cycle) => {
      if (cycle.endDate) {
        const length = Math.floor((cycle.endDate - cycle.startDate) / (1000 * 60 * 60 * 24)) + 1
        periodLengths.push(length)
      }
    })

    const flowStats = {
      light: cycles.filter((c) => c.flowLevel === "light").length,
      medium: cycles.filter((c) => c.flowLevel === "medium").length,
      heavy: cycles.filter((c) => c.flowLevel === "heavy").length,
    }

    const symptomFrequency = {}
    cycles.forEach((cycle) => {
      cycle.symptoms?.forEach((symptom) => {
        symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1
      })
    })

    const stats = {
      total_cycles: cycles.length,
      average_cycle_length:
        cycleLengths.length > 0 ? Math.round(cycleLengths.reduce((a, b) => a + b) / cycleLengths.length) : null,
      min_cycle_length: cycleLengths.length > 0 ? Math.min(...cycleLengths) : null,
      max_cycle_length: cycleLengths.length > 0 ? Math.max(...cycleLengths) : null,
      average_period_length:
        periodLengths.length > 0 ? Math.round(periodLengths.reduce((a, b) => a + b) / periodLengths.length) : null,
      flow_distribution: flowStats,
      common_symptoms: Object.entries(symptomFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([symptom, count]) => ({ symptom, count })),
    }

    res.json(stats)
  } catch (error) {
    next(error)
  }
})

router.get("/:patientId/predict", authenticate, authorize("patient"), async (req, res, next) => {
  try {
    if (req.params.patientId !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const cycles = await CycleData.find({ patientId: req.params.patientId })
      .sort({ startDate: -1 })
      .limit(LOOKBACK_N)

    if (cycles.length < 2) {
      return res.status(400).json({ error: "Need at least 2 cycles for prediction" })
    }

    const cycleLengths = []
    for (let i = 0; i < cycles.length - 1; i++) {
      const length = Math.floor((cycles[i].startDate - cycles[i + 1].startDate) / (1000 * 60 * 60 * 24))
      if (length > 0) cycleLengths.push(length)
    }

    if (cycleLengths.length === 0) {
      return res.status(400).json({ error: "Invalid cycle data" })
    }

    const averageCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b) / cycleLengths.length)
    const lastStartDate = new Date(cycles[0].startDate)

    const predictedNextStart = new Date(lastStartDate)
    predictedNextStart.setDate(predictedNextStart.getDate() + averageCycleLength)

    const fertilityWindowStart = new Date(predictedNextStart)
    fertilityWindowStart.setDate(fertilityWindowStart.getDate() - (LUTEAL_DAYS + FERTILITY_MARGIN))

    const fertilityWindowEnd = new Date(predictedNextStart)
    fertilityWindowEnd.setDate(fertilityWindowEnd.getDate() - (LUTEAL_DAYS - FERTILITY_MARGIN))

    const periodLengths = []
    cycles.forEach((cycle) => {
      if (cycle.endDate) {
        const length = Math.floor((cycle.endDate - cycle.startDate) / (1000 * 60 * 60 * 24)) + 1
        periodLengths.push(length)
      }
    })

    const averagePeriodLength =
      periodLengths.length > 0 ? Math.round(periodLengths.reduce((a, b) => a + b) / periodLengths.length) : null

    res.json({
      predicted_next_start: predictedNextStart,
      fertility_window_start: fertilityWindowStart,
      fertility_window_end: fertilityWindowEnd,
      average_cycle_length: averageCycleLength,
      average_period_length: averagePeriodLength,
      confidence: cycleLengths.length >= 3 ? "high" : "medium",
    })
  } catch (error) {
    next(error)
  }
})

router.patch("/:id", authenticate, authorize("patient"), async (req, res, next) => {
  try {
    const { endDate, flowLevel, symptoms } = req.body

    const cycle = await CycleData.findOne({ cycleId: req.params.id })

    if (!cycle) {
      return res.status(404).json({ error: "Cycle not found" })
    }

    if (cycle.patientId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    // Validation: End date cannot be before start date
    if (endDate && new Date(endDate) < new Date(cycle.startDate)) {
      return res.status(400).json({ error: "End date cannot be before start date" })
    }

    if (endDate) cycle.endDate = new Date(endDate)
    if (flowLevel) cycle.flowLevel = flowLevel
    if (symptoms) cycle.symptoms = symptoms

    await cycle.save()
    res.json(cycle)
  } catch (error) {
    next(error)
  }
})

router.delete("/:id", authenticate, authorize("patient"), async (req, res, next) => {
  try {
    const cycle = await CycleData.findOne({ cycleId: req.params.id })

    if (!cycle) {
      return res.status(404).json({ error: "Cycle not found" })
    }

    if (cycle.patientId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    await CycleData.deleteOne({ cycleId: req.params.id })
    res.json({ message: "Cycle deleted" })
  } catch (error) {
    next(error)
  }
})

export default router
