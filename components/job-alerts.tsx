"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Plus, Trash, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useXP } from "./xp-provider"

export default function JobAlerts() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: "Frontend Developer",
      location: "Remote",
      frequency: "daily",
      active: true,
    },
    {
      id: 2,
      title: "UX Designer",
      location: "San Francisco",
      frequency: "weekly",
      active: true,
    },
  ])

  const [showNewAlert, setShowNewAlert] = useState(false)
  const [newAlert, setNewAlert] = useState({
    title: "",
    location: "",
    frequency: "daily",
    active: true,
  })

  const { toast } = useToast()
  const { addXP } = useXP()

  const handleAddAlert = () => {
    if (!newAlert.title) {
      toast({
        title: "Error",
        description: "Please enter a job title",
        variant: "destructive",
      })
      return
    }

    const id = alerts.length > 0 ? Math.max(...alerts.map((a) => a.id)) + 1 : 1

    setAlerts([...alerts, { ...newAlert, id }])
    setNewAlert({
      title: "",
      location: "",
      frequency: "daily",
      active: true,
    })
    setShowNewAlert(false)

    toast({
      title: "Job Alert Created",
      description: "You'll receive notifications for matching jobs",
    })

    addXP(10)
  }

  const toggleAlertStatus = (id) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, active: !alert.active } : alert)))
  }

  const deleteAlert = (id) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))

    toast({
      title: "Job Alert Deleted",
      description: "Your job alert has been removed",
    })
  }

  return (
    <Card className="cyberpunk-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-gradient">Job Alerts</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNewAlert(!showNewAlert)}
          className="border-accent hover:bg-accent/10"
        >
          <Plus className="h-4 w-4 mr-1" />
          Create Alert
        </Button>
      </CardHeader>

      <CardContent>
        {showNewAlert && (
          <div className="mb-6 p-4 border border-accent/30 rounded-lg bg-accent/5">
            <h3 className="font-medium mb-3">New Job Alert</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="alert-title">Job Title</Label>
                <Input
                  id="alert-title"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  placeholder="e.g., Frontend Developer"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="alert-location">Location (optional)</Label>
                <Input
                  id="alert-location"
                  value={newAlert.location}
                  onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
                  placeholder="e.g., Remote, New York"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="alert-frequency">Frequency</Label>
                <select
                  id="alert-frequency"
                  value={newAlert.frequency}
                  onChange={(e) => setNewAlert({ ...newAlert, frequency: e.target.value })}
                  className="w-full mt-1 p-2 rounded-md border border-input bg-background"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="instant">Instant</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="alert-active">Active</Label>
                <Switch
                  id="alert-active"
                  checked={newAlert.active}
                  onCheckedChange={(checked) => setNewAlert({ ...newAlert, active: checked })}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowNewAlert(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAlert}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Alert
                </Button>
              </div>
            </div>
          </div>
        )}

        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full ${alert.active ? "bg-primary/10" : "bg-gray-200 dark:bg-gray-700"} mr-3`}
                  >
                    <Bell className={`h-5 w-5 ${alert.active ? "text-primary" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {alert.location ? alert.location : "Any location"} •{" "}
                      {alert.frequency.charAt(0).toUpperCase() + alert.frequency.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={alert.active} onCheckedChange={() => toggleAlertStatus(alert.id)} />
                  <Button variant="ghost" size="icon" onClick={() => deleteAlert(alert.id)}>
                    <Trash className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-1">No job alerts yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create alerts to get notified about new job opportunities
            </p>
            <Button onClick={() => setShowNewAlert(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Create Your First Alert
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
        <p>Job alerts help you stay updated with the latest opportunities matching your criteria.</p>
      </CardFooter>
    </Card>
  )
}
