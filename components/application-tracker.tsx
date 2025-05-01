"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash,
  Calendar,
  Building,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  BarChart,
} from "lucide-react"
import { useXP } from "./xp-provider"

// Mock application data
const initialApplications = [
  {
    id: 1,
    company: "TechCorp",
    position: "Frontend Developer",
    status: "applied",
    date: "2023-04-15",
    notes: "Applied through company website. Used referral from John.",
    nextStep: "Follow up by email on April 22",
  },
  {
    id: 2,
    company: "DesignHub",
    position: "UX/UI Designer",
    status: "interview",
    date: "2023-04-10",
    notes: "Had first interview with HR. Technical interview scheduled.",
    nextStep: "Prepare portfolio presentation for technical interview",
  },
  {
    id: 3,
    company: "DataWorks",
    position: "Data Scientist",
    status: "rejected",
    date: "2023-03-28",
    notes: "Got rejection email. They went with a candidate with more experience.",
    nextStep: "Ask for feedback",
  },
  {
    id: 4,
    company: "StartupX",
    position: "Junior Web Developer",
    status: "offer",
    date: "2023-04-05",
    notes: "Received offer: $75k/year with benefits and remote work option.",
    nextStep: "Review contract and respond by April 20",
  },
]

export default function ApplicationTracker() {
  const [applications, setApplications] = useState(initialApplications)
  const [activeTab, setActiveTab] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentApplication, setCurrentApplication] = useState(null)
  const [newApplication, setNewApplication] = useState({
    company: "",
    position: "",
    status: "applied",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    nextStep: "",
  })
  const { addXP } = useXP()

  const handleAddApplication = () => {
    setShowAddDialog(true)
    setNewApplication({
      company: "",
      position: "",
      status: "applied",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      nextStep: "",
    })
  }

  const handleEditApplication = (app) => {
    setCurrentApplication(app)
    setNewApplication({
      company: app.company,
      position: app.position,
      status: app.status,
      date: app.date,
      notes: app.notes,
      nextStep: app.nextStep,
    })
    setShowEditDialog(true)
  }

  const handleDeleteApplication = (id) => {
    setApplications(applications.filter((app) => app.id !== id))
    addXP(5)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewApplication({ ...newApplication, [name]: value })
  }

  const handleSubmitAdd = () => {
    const newId = applications.length > 0 ? Math.max(...applications.map((app) => app.id)) + 1 : 1
    setApplications([...applications, { id: newId, ...newApplication }])
    setShowAddDialog(false)
    addXP(10)
  }

  const handleSubmitEdit = () => {
    setApplications(applications.map((app) => (app.id === currentApplication.id ? { ...app, ...newApplication } : app)))
    setShowEditDialog(false)
    addXP(5)
  }

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "all") return true
    return app.status === activeTab
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "interview":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "offer":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "applied":
        return <Clock className="h-4 w-4" />
      case "interview":
        return <Calendar className="h-4 w-4" />
      case "offer":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const statusCounts = {
    applied: applications.filter((app) => app.status === "applied").length,
    interview: applications.filter((app) => app.status === "interview").length,
    offer: applications.filter((app) => app.status === "offer").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Applications</CardTitle>
              <Button onClick={handleAddApplication} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Application
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
                  <TabsTrigger value="applied">Applied ({statusCounts.applied})</TabsTrigger>
                  <TabsTrigger value="interview">Interview ({statusCounts.interview})</TabsTrigger>
                  <TabsTrigger value="offer">Offer ({statusCounts.offer})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-0">
                  <ApplicationList
                    applications={filteredApplications}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteApplication}
                  />
                </TabsContent>

                <TabsContent value="applied" className="mt-0">
                  <ApplicationList
                    applications={filteredApplications}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteApplication}
                  />
                </TabsContent>

                <TabsContent value="interview" className="mt-0">
                  <ApplicationList
                    applications={filteredApplications}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteApplication}
                  />
                </TabsContent>

                <TabsContent value="offer" className="mt-0">
                  <ApplicationList
                    applications={filteredApplications}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteApplication}
                  />
                </TabsContent>

                <TabsContent value="rejected" className="mt-0">
                  <ApplicationList
                    applications={filteredApplications}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteApplication}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Application Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Application Status</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Applied</span>
                        <span>{statusCounts.applied}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${applications.length > 0 ? (statusCounts.applied / applications.length) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Interview</span>
                        <span>{statusCounts.interview}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{
                            width: `${
                              applications.length > 0 ? (statusCounts.interview / applications.length) * 100 : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Offer</span>
                        <span>{statusCounts.offer}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${applications.length > 0 ? (statusCounts.offer / applications.length) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Rejected</span>
                        <span>{statusCounts.rejected}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{
                            width: `${
                              applications.length > 0 ? (statusCounts.rejected / applications.length) * 100 : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">Application Insights</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                          <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Response Rate</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {applications.length > 0
                              ? `${Math.round(
                                  ((statusCounts.interview + statusCounts.offer) / applications.length) * 100,
                                )}%`
                              : "0%"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Success Rate</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {applications.length > 0
                              ? `${Math.round((statusCounts.offer / applications.length) * 100)}%`
                              : "0%"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications
                  .filter((app) => app.nextStep)
                  .slice(0, 3)
                  .map((app) => (
                    <div key={app.id} className="p-3 border rounded-lg">
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            app.status === "interview"
                              ? "bg-yellow-500"
                              : app.status === "offer"
                                ? "bg-green-500"
                                : "bg-blue-500"
                          }`}
                        ></div>
                        <h4 className="font-medium">{app.company}</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{app.nextStep}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{app.position}</p>
                    </div>
                  ))}

                {applications.filter((app) => app.nextStep).length === 0 && (
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium mb-1">No upcoming tasks</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Add next steps to your applications to see them here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    value={newApplication.company}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    value={newApplication.position}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={newApplication.status}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 rounded-md border border-input bg-background"
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={newApplication.date}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={newApplication.notes}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="nextStep">Next Step</Label>
                <Input
                  id="nextStep"
                  name="nextStep"
                  value={newApplication.nextStep}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitAdd}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Application</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    name="company"
                    value={newApplication.company}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-position">Position</Label>
                  <Input
                    id="edit-position"
                    name="position"
                    value={newApplication.position}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    id="edit-status"
                    name="status"
                    value={newApplication.status}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 rounded-md border border-input bg-background"
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-date">Date</Label>
                  <Input
                    id="edit-date"
                    name="date"
                    type="date"
                    value={newApplication.date}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  value={newApplication.notes}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-nextStep">Next Step</Label>
                <Input
                  id="edit-nextStep"
                  name="nextStep"
                  value={newApplication.nextStep}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function ApplicationList({ applications, getStatusColor, getStatusIcon, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      {applications.length > 0 ? (
        applications.map((app) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <div className="flex items-center mb-2 md:mb-0">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full mr-3">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">{app.company}</h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Briefcase className="h-4 w-4 mr-1" />
                    <span>{app.position}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`flex items-center gap-1 ${getStatusColor(app.status)}`}>
                  {getStatusIcon(app.status)}
                  <span className="capitalize">{app.status}</span>
                </Badge>
                <div className="text-sm text-gray-500 dark:text-gray-400">{app.date}</div>
              </div>
            </div>

            {(app.notes || app.nextStep) && (
              <div className="mt-3 pt-3 border-t">
                {app.notes && (
                  <div className="mb-2">
                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{app.notes}</p>
                  </div>
                )}
                {app.nextStep && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Next Step</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{app.nextStep}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 pt-3 border-t flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(app)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-500" onClick={() => onDelete(app.id)}>
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No applications found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start tracking your job applications by adding your first one
          </p>
        </div>
      )}
    </div>
  )
}
