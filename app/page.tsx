import { readFile } from "node:fs/promises"
import { join } from "node:path"

interface Experience {
  title: string
  company: string
  period: string
  location: string
  description: string[]
  tech: string
}

interface Skills {
  [category: string]: string[]
}

async function getCVData() {
  const cvContent = await readFile(join(process.cwd(), "content", "cv.md"), "utf-8")

  const lines = cvContent.split("\n")
  let name = ""
  let title = ""
  let location = ""
  let intro = ""
  const experiences: Experience[] = []
  const skills: Skills = {}

  let currentSection = ""
  let currentExp: Experience | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith("# ")) {
      name = line.replace("# ", "").trim()
    } else if (line.startsWith("## ") && !line.includes("Experience") && !line.includes("Core Skills")) {
      title = line.replace("## ", "").trim()
    } else if (line.startsWith("**Location:**")) {
      location = line.replace("**Location:**", "").trim()
    } else if (line.startsWith("Experienced software")) {
      intro = line.trim()
    } else if (line.includes("## Experience")) {
      currentSection = "experience"
    } else if (line.includes("## Core Skills")) {
      currentSection = "skills"
    } else if (line.startsWith("### ") && currentSection === "experience") {
      if (currentExp) experiences.push(currentExp)
      currentExp = {
        title: line.replace("### ", "").trim(),
        company: "",
        period: "",
        location: "",
        description: [],
        tech: "",
      }
    } else if (line.startsWith("**") && currentExp && line.includes("|")) {
      const parts = line.split("|").map((p) => p.trim())
      currentExp.company = parts[0].replace(/\*\*/g, "").trim()
      currentExp.period = parts[1].replace(/\*\*/g, "").trim()
      currentExp.location = parts[2]?.replace(/\*\*/g, "").trim() || ""
    } else if (line.startsWith("- ") && currentExp) {
      currentExp.description.push(line.replace("- ", "").trim())
    } else if (line.startsWith("**Tech:**") && currentExp) {
      currentExp.tech = line.replace("**Tech:**", "").trim()
    } else if (line.startsWith("### ") && currentSection === "skills") {
      const skillCategory = line.replace("### ", "").trim()
      const nextLine = lines[i + 1]
      if (nextLine) {
        skills[skillCategory] = nextLine.split(",").map((s) => s.trim())
      }
    }
  }

  if (currentExp) experiences.push(currentExp)

  return { name, title, location, intro, experiences, skills }
}

export default async function CVPage() {
  const { name, title, location, intro, experiences, skills } = await getCVData()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{name}</h1>
          <p className="text-xl text-muted-foreground mb-2">{title}</p>
          <p className="text-sm text-muted-foreground">{location}</p>
          <p className="mt-4 text-foreground leading-relaxed">{intro}</p>
        </header>

        {/* Experience */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Experience</h2>
          <div className="space-y-8">
            {experiences.map((exp, idx) => (
              <div key={idx} className="border-l-2 border-accent pl-6">
                <h3 className="text-xl font-semibold mb-1">{exp.title}</h3>
                <div className="text-sm text-muted-foreground mb-3">
                  <span className="font-medium">{exp.company}</span> · {exp.period}
                  {exp.location && ` · ${exp.location}`}
                </div>
                <ul className="space-y-2 mb-3">
                  {exp.description.map((desc, descIdx) => (
                    <li key={descIdx} className="text-sm text-foreground flex gap-2">
                      <span className="text-accent mt-1">•</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
                {exp.tech && (
                  <p className="text-sm">
                    <span className="font-medium">Tech:</span> {exp.tech}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Core Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category}>
                <h3 className="font-semibold mb-2">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
