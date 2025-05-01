// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import {
//   ThumbsUp,
//   ThumbsDown,
//   MessageSquare,
//   Share,
//   FileUp,
//   Plus,
//   Search,
//   Award,
//   TrendingUp,
//   Clock,
//   Users,
// } from "lucide-react"

// // Mock resume posts
// const mockPosts = [
//   {
//     id: 1,
//     user: {
//       name: "Alex Johnson",
//       avatar: "/placeholder.svg?height=40&width=40",
//       title: "Frontend Developer",
//     },
//     title: "My Updated React Developer Resume",
//     description: "Just updated my resume with my latest React and TypeScript projects. Looking for feedback!",
//     skills: ["React", "TypeScript", "Tailwind CSS"],
//     likes: 24,
//     comments: 8,
//     timeAgo: "2 hours ago",
//     upvotes: 18,
//     downvotes: 2,
//   },
//   {
//     id: 2,
//     user: {
//       name: "Sam Wilson",
//       avatar: "/placeholder.svg?height=40&width=40",
//       title: "UX Designer",
//     },
//     title: "UX Designer Portfolio - Feedback Welcome",
//     description: "I've redesigned my UX portfolio to showcase my latest work. Would love some constructive criticism!",
//     skills: ["UI/UX", "Figma", "User Research"],
//     likes: 31,
//     comments: 12,
//     timeAgo: "5 hours ago",
//     upvotes: 27,
//     downvotes: 1,
//   },
//   {
//     id: 3,
//     user: {
//       name: "Jamie Smith",
//       avatar: "/placeholder.svg?height=40&width=40",
//       title: "Full Stack Developer",
//     },
//     title: "Full Stack Developer Resume - MERN Stack",
//     description:
//       "After 3 years of experience, I've updated my resume to focus on my MERN stack projects. Any suggestions?",
//     skills: ["MongoDB", "Express", "React", "Node.js"],
//     likes: 19,
//     comments: 6,
//     timeAgo: "1 day ago",
//     upvotes: 15,
//     downvotes: 3,
//   },
//   {
//     id: 4,
//     user: {
//       name: "Taylor Reed",
//       avatar: "/placeholder.svg?height=40&width=40",
//       title: "Data Scientist",
//     },
//     title: "Data Science Resume - Transitioning from Academia",
//     description:
//       "I'm transitioning from academia to industry. Here's my resume focused on ML and data visualization projects.",
//     skills: ["Python", "Machine Learning", "Data Visualization"],
//     likes: 42,
//     comments: 15,
//     timeAgo: "2 days ago",
//     upvotes: 38,
//     downvotes: 4,
//   },
// ]

// // Mock top resumes
// const mockTopResumes = [
//   {
//     id: 1,
//     user: "Alex Johnson",
//     title: "Senior Frontend Developer",
//     score: 98,
//     upvotes: 124,
//   },
//   {
//     id: 2,
//     user: "Morgan Lee",
//     title: "UX/UI Designer",
//     score: 95,
//     upvotes: 112,
//   },
//   {
//     id: 3,
//     user: "Jordan Casey",
//     title: "Full Stack Engineer",
//     score: 92,
//     upvotes: 98,
//   },
//   {
//     id: 4,
//     user: "Riley Quinn",
//     title: "Product Manager",
//     score: 90,
//     upvotes: 87,
//   },
//   {
//     id: 5,
//     user: "Taylor Smith",
//     title: "Data Scientist",
//     score: 89,
//     upvotes: 82,
//   },
// ]

// export default function SocialNetwork() {
//   const [messages, setMessages] = useState([])
//   const [input, setInput] = useState("")
//   const [showPostModal, setShowPostModal] = useState(false)
//   const [newPost, setNewPost] = useState({
//     title: "",
//     description: "",
//     skills: "",
//     file: null,
//   })

//   const handlePostChange = (e) => {
//     const { name, value } = e.target
//     setNewPost({ ...newPost, [name]: value })
//   }

//   const handleFileChange = (e) => {
//     const file = e.target.files[0]
//     if (file) {
//       setNewPost({ ...newPost, file })
//     }
//   }

//   const handleSubmitPost = () => {
//     // Handle post submission
//     setShowPostModal(false)
//     setNewPost({
//       title: "",
//       description: "",
//       skills: "",
//       file: null,
//     })
//   }

//   return (
//     <div className="w-full">
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-4">
//           <Tabs defaultValue="feed" className="w-full">
//             <TabsList>
//               <TabsTrigger value="feed" className="flex items-center gap-2">
//                 <TrendingUp className="h-4 w-4" />
//                 <span>Feed</span>
//               </TabsTrigger>
//               <TabsTrigger value="trending" className="flex items-center gap-2">
//                 <Award className="h-4 w-4" />
//                 <span>Top Resumes</span>
//               </TabsTrigger>
//               <TabsTrigger value="network" className="flex items-center gap-2">
//                 <Users className="h-4 w-4" />
//                 <span>My Network</span>
//               </TabsTrigger>
//               <TabsTrigger value="recent" className="flex items-center gap-2">
//                 <Clock className="h-4 w-4" />
//                 <span>Recent</span>
//               </TabsTrigger>
//             </TabsList>

//             <div className="mt-6">
//               <Button onClick={() => setShowPostModal(true)} className="bg-primary hover:bg-primary/90">
//                 <Plus className="mr-2 h-4 w-4" />
//                 Post Resume
//               </Button>
//             </div>

//             <div className="content-grid mt-6">
//               <div className="content-main">
//                 <div className="mb-6">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input placeholder="Search resumes, skills, or users..." className="pl-10" />
//                   </div>
//                 </div>

//                 <TabsContent value="feed" className="mt-0">
//                   <div className="space-y-6">
//                     {mockPosts.map((post) => (
//                       <Card key={post.id} className="simple-card">
//                         <CardHeader className="pb-2">
//                           <div className="flex items-start justify-between">
//                             <div className="flex items-center">
//                               <Avatar className="h-10 w-10 mr-3">
//                                 <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.name} />
//                                 <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
//                               </Avatar>
//                               <div>
//                                 <CardTitle className="text-base">{post.user.name}</CardTitle>
//                                 <p className="text-sm text-gray-500 dark:text-gray-400">{post.user.title}</p>
//                               </div>
//                             </div>
//                             <p className="text-xs text-gray-500 dark:text-gray-400">{post.timeAgo}</p>
//                           </div>
//                         </CardHeader>
//                         <CardContent className="pb-2">
//                           <h3 className="text-lg font-bold mb-2">{post.title}</h3>
//                           <p className="text-gray-600 dark:text-gray-300 mb-3">{post.description}</p>
//                           <div className="flex flex-wrap gap-2 mb-2">
//                             {post.skills.map((skill, index) => (
//                               <Badge key={index} variant="secondary" className="simple-badge">
//                                 {skill}
//                               </Badge>
//                             ))}
//                           </div>
//                           <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
//                             <div className="flex items-center">
//                               <FileUp className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
//                               <span className="text-sm">resume-v2.pdf</span>
//                             </div>
//                             <Button variant="outline" size="sm">
//                               View
//                             </Button>
//                           </div>
//                         </CardContent>
//                         <CardFooter className="pt-2 flex justify-between">
//                           <div className="flex items-center gap-4">
//                             <div className="flex items-center">
//                               <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
//                                 <ThumbsUp className="h-4 w-4" />
//                               </Button>
//                               <span className="text-sm">{post.upvotes}</span>
//                             </div>
//                             <div className="flex items-center">
//                               <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
//                                 <ThumbsDown className="h-4 w-4" />
//                               </Button>
//                               <span className="text-sm">{post.downvotes}</span>
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Button variant="ghost" size="sm" className="flex items-center gap-1">
//                               <MessageSquare className="h-4 w-4" />
//                               <span>{post.comments}</span>
//                             </Button>
//                             <Button variant="ghost" size="sm" className="flex items-center gap-1">
//                               <Share className="h-4 w-4" />
//                               <span>Share</span>
//                             </Button>
//                           </div>
//                         </CardFooter>
//                       </Card>
//                     ))}
//                   </div>
//                 </TabsContent>

//                 <TabsContent value="trending" className="mt-0">
//                   <Card>
//                     <CardHeader>
//                       <CardTitle>Top Rated Resumes This Week</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-4">
//                         {mockTopResumes.map((resume, index) => (
//                           <div
//                             key={resume.id}
//                             className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//                           >
//                             <div className="flex items-center">
//                               <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">
//                                 {index + 1}
//                               </div>
//                               <div>
//                                 <h3 className="font-medium">{resume.user}</h3>
//                                 <p className="text-sm text-gray-500 dark:text-gray-400">{resume.title}</p>
//                               </div>
//                             </div>
//                             <div className="flex items-center gap-4">
//                               <div className="text-right">
//                                 <div className="text-sm font-medium">{resume.score}/100</div>
//                                 <div className="text-xs text-gray-500 dark:text-gray-400">{resume.upvotes} upvotes</div>
//                               </div>
//                               <Button variant="outline" size="sm">
//                                 View
//                               </Button>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="network" className="mt-0">
//                   <Card className="p-6 text-center">
//                     <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
//                     <h3 className="text-lg font-medium mb-2">Build Your Network</h3>
//                     <p className="text-gray-500 dark:text-gray-400 mb-4">
//                       Connect with other professionals to grow your network and get more feedback on your resume
//                     </p>
//                     <Button className="bg-primary hover:bg-primary/90">Find Connections</Button>
//                   </Card>
//                 </TabsContent>

//                 <TabsContent value="recent" className="mt-0">
//                   <Card className="p-6 text-center">
//                     <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
//                     <h3 className="text-lg font-medium mb-2">Recent Activity</h3>
//                     <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't viewed any resumes recently</p>
//                     <Button className="bg-primary hover:bg-primary/90">Browse Resumes</Button>
//                   </Card>
//                 </TabsContent>
//               </div>

//               <div className="content-sidebar">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Your Profile</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="flex items-center mb-4">
//                       <Avatar className="h-16 w-16 mr-4">
//                         <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Your profile" />
//                         <AvatarFallback>YN</AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <h3 className="font-bold text-lg">Your Name</h3>
//                         <p className="text-gray-500 dark:text-gray-400">Frontend Developer</p>
//                       </div>
//                     </div>

//                     <div className="space-y-4">
//                       <div>
//                         <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Resume Score</h4>
//                         <div className="flex items-center mt-1">
//                           <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full">
//                             <div className="h-full bg-primary rounded-full" style={{ width: "85%" }}></div>
//                           </div>
//                           <span className="ml-2 font-bold">85%</span>
//                         </div>
//                       </div>

//                       <div>
//                         <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile Views</h4>
//                         <p className="\
