"use client"

import { WorkSimulation } from "@/components/work-simulation"

export default function WorkSimulationPage() {
  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-primary">Work Simulations</h1>
      <WorkSimulation />
    </div>
  )
}
