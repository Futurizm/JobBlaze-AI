"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, MapPin, Briefcase, Search } from "lucide-react"

// Mock salary data
const mockSalaryData = {
  "Frontend Developer": {
    national: 95000,
    byLocation: {
      "San Francisco, CA": 130000,
      "New York, NY": 120000,
      "Austin, TX": 100000,
      "Chicago, IL": 95000,
      Remote: 105000,
    },
    byExperience: {
      "0-1 years": 75000,
      "1-3 years": 90000,
      "3-5 years": 110000,
      "5+ years": 135000,
    },
    trending: "+5.2% from last year",
  },
  "UX Designer": {
    national: 90000,
    byLocation: {
      "San Francisco, CA": 125000,
      "New York, NY": 115000,
      "Austin, TX": 95000,
      "Chicago, IL": 90000,
      Remote: 100000,
    },
    byExperience: {
      "0-1 years": 70000,
      "1-3 years": 85000,
      "3-5 years": 105000,
      "5+ years": 130000,
    },
    trending: "+4.8% from last year",
  },
  "Data Scientist": {
    national: 115000,
    byLocation: {
      "San Francisco, CA": 145000,
      "New York, NY": 135000,
      "Austin, TX": 120000,
      "Chicago, IL": 110000,
      Remote: 125000,
    },
    byExperience: {
      "0-1 years": 90000,
      "1-3 years": 110000,
      "3-5 years": 130000,
      "5+ years": 160000,
    },
    trending: "+7.5% from last year",
  },
  "Software Engineer": {
    national: 105000,
    byLocation: {
      "San Francisco, CA": 140000,
      "New York, NY": 130000,
      "Austin, TX": 110000,
      "Chicago, IL": 100000,
      Remote: 115000,
    },
    byExperience: {
      "0-1 years": 85000,
      "1-3 years": 100000,
      "3-5 years": 120000,
      "5+ years": 150000,
    },
    trending: "+6.3% from last year",
  },
}

export default function SalaryInsights() {
  const [jobTitle, setJobTitle] = useState("")
  const [location, setLocation] = useState("")
  const [experience, setExperience] = useState("")
  const [searchResults, setSearchResults] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  const handleSearch = () => {
    if (!jobTitle) return

    // Find closest match in our mock data
    const titles = Object.keys(mockSalaryData)
    const matchedTitle =
      titles.find((title) => title.toLowerCase() === jobTitle.toLowerCase()) ||
      titles.find((title) => title.toLowerCase().includes(jobTitle.toLowerCase()))

    if (matchedTitle) {
      setSearchResults({
        title: matchedTitle,
        data: mockSalaryData[matchedTitle],
      })
    } else {
      // No match found, use default data
      setSearchResults({
        title: jobTitle,
        data: {
          national: 85000,
          byLocation: {
            "San Francisco, CA": 115000,
            "New York, NY": 105000,
            "Austin, TX": 90000,
            "Chicago, IL": 85000,
            Remote: 95000,
          },
          byExperience: {
            "0-1 years": 65000,
            "1-3 years": 80000,
            "3-5 years": 100000,
            "5+ years": 125000,
          },
          trending: "+4.5% from last year",
        },
      })
    }
  }

  return (
    <Card className="cyberpunk-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gradient">Salary Insights</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-3 lg:col-span-1">
              <Label htmlFor="job-title">Job Title</Label>
              <div className="relative mt-1">
                <Input
                  id="job-title"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Frontend Developer"
                  className="pl-10"
                />
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <div className="relative mt-1">
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., San Francisco"
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="experience">Experience (optional)</Label>
              <select
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full mt-1 p-2 rounded-md border border-input bg-background"
              >
                <option value="">Any experience</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full">
            <Search className="h-4 w-4 mr-1" />
            Search Salaries
          </Button>
        </div>

        {searchResults ? (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">{searchResults.title}</h3>
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-full mr-3">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${searchResults.data.national.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                    {searchResults.data.trending}
                  </p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="location">By Location</TabsTrigger>
                <TabsTrigger value="experience">By Experience</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2">National Average</h4>
                  <p className="text-xl font-bold">${searchResults.data.national.toLocaleString()}/year</p>
                  <p className="text-sm text-gray-500 mt-1">Based on thousands of salary reports</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Top Paying Location</h4>
                    <p className="text-lg font-bold">San Francisco, CA</p>
                    <p className="text-primary font-medium">
                      ${searchResults.data.byLocation["San Francisco, CA"].toLocaleString()}/year
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Experience Impact</h4>
                    <p className="text-lg font-bold">5+ years experience</p>
                    <p className="text-primary font-medium">
                      +$
                      {(
                        searchResults.data.byExperience["5+ years"] - searchResults.data.byExperience["0-1 years"]
                      ).toLocaleString()}
                      /year
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                {Object.entries(searchResults.data.byLocation).map(([loc, salary]) => (
                  <div key={loc} className="flex justify-between items-center p-3 border-b">
                    <div>
                      <p className="font-medium">{loc}</p>
                    </div>
                    <p className="font-bold">${salary.toLocaleString()}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                {Object.entries(searchResults.data.byExperience).map(([exp, salary]) => (
                  <div key={exp} className="flex justify-between items-center p-3 border-b">
                    <div>
                      <p className="font-medium">{exp}</p>
                    </div>
                    <p className="font-bold">${salary.toLocaleString()}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-6">
            <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-1">Search for salary insights</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Enter a job title to see average salaries and trends
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
