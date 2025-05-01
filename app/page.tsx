"use client";

import { useState } from "react";
import HeroSection from "@/components/hero-section";
import JobListingsGrid from "@/components/job-listings-grid";

console.log("JobListingsGrid:", JobListingsGrid);

export default function Home() {
  const [resumeData, setResumeData] = useState({
    skills: "",
    role: "",
    roleText: "",
    experience: "",
    workFormat: "",
    searchLogic: "AND" as "AND" | "OR", // По умолчанию AND
  });

  const handleResumeParsed = (data: {
    skills: string;
    role: string;
    roleText: string;
    experience: string;
    workFormat: string;
    searchLogic: "AND" | "OR";
  }) => {
    setResumeData(data);
  };

  if (!JobListingsGrid) {
    return (
      <main>
        <HeroSection onResumeParsed={handleResumeParsed} />
        <p>Error: JobListingsGrid component is not available.</p>
      </main>
    );
  }

  return (
    <main>
      <HeroSection onResumeParsed={handleResumeParsed} />
      <JobListingsGrid
        skills={resumeData.skills}
        role={resumeData.role}
        roleText={resumeData.roleText}
        experience={resumeData.experience}
        workFormat={resumeData.workFormat}
        searchLogic={resumeData.searchLogic} // Передаём searchLogic
      />
    </main>
  );
}