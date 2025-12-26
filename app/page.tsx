import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Linkedin, Mail, MapPin } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"
import fs from "fs"
import path from "path"

async function getCVContent() {
  const filePath = path.join(process.cwd(), "content", "cv.md")
  const content = fs.readFileSync(filePath, "utf-8")
  return parseCV(content)
}

function parseCV(markdown: string) {
  const lines = markdown.split("\n")
  const data: any = {
    name: "",
    title: "",
    location: "",
    summary: "",
    experiences: [],
    skills: {},
  }

  let currentSection = ""
  let currentExp: any = null
  let currentSkillCategory = ""

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith("# ")) {
      data.name = line.replace("# ", "")
    } else if (line.startsWith("## ") && !line.includes("Experience") && !line.includes("Core Skills")) {
      data.title = line.replace("## ", "")
    } else if (line.startsWith("**Location:**")) {
      data.location = line.replace("**Location:**", "").trim()
    } else if (line.startsWith("## Experience")) {
      currentSection = "experience"
    } else if (line.startsWith("## Core Skills")) {
      currentSection = "skills"
    } else if (line.startsWith("### ") && currentSection === "experience") {
      if (currentExp) {
        data.experiences.push(currentExp)
      }
      currentExp = {
        title: line.replace("### ", ""),
        company: "",
        period: "",
        location: "",
        description: [],
        tech: [],
      }
    } else if (line.startsWith("**") && line.includes("|") && currentExp) {
      const parts = line.split("|").map((p) => p.trim())
      currentExp.company = parts[0].replace(/\*\*/g, "")
      currentExp.period = parts[1]
      currentExp.location = parts[2]
    } else if (line.startsWith("- ") && currentExp) {
      currentExp.description.push(line.replace("- ", ""))
    } else if (line.startsWith("**Tech:**") && currentExp) {
      currentExp.tech = line
        .replace("**Tech:**", "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    } else if (line.startsWith("### ") && currentSection === "skills") {
      currentSkillCategory = line.replace("### ", "")
      data.skills[currentSkillCategory] = []
    } else if (currentSection === "skills" && currentSkillCategory && line && !line.startsWith("---")) {
      data.skills[currentSkillCategory] = line
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    } else if (!data.summary && line && !line.startsWith("---") && !line.startsWith("**") && currentSection === "") {
      data.summary += (data.summary ? " " : "") + line
    }

    if (line === "---" && currentExp) {
      data.experiences.push(currentExp)
      currentExp = null
    }
  }

  if (currentExp) {
    data.experiences.push(currentExp)
  }

  return data
}

export default async function Page() {
  const cv = await getCVContent()

  return (
    <div className="min-h-screen bg-background">
      <div className="theme-switcher fixed right-6 top-6 z-50 print:hidden">
        <ThemeSwitcher />
      </div>
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
        {/* Header */}
        <header className="mb-16">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl">{cv.name}</h1>
          <p className="mb-4 text-xl text-muted-foreground md:text-2xl">{cv.title}</p>
          <div className="mb-6 flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{cv.location}</span>
          </div>
          <p className="max-w-3xl text-pretty leading-relaxed text-foreground">{cv.summary}</p>
          <div className="mt-6 flex gap-4">
            <a
              href="mailto:jurajsim@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </a>
            <a
              href="https://github.com/simonjur"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/juraj-simon"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
        </header>

        {/* Experience */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-semibold text-foreground">Experience</h2>
          <div className="space-y-12">
            {cv.experiences.map((exp: any, index: number) => (
              <ExperienceItem key={index} {...exp} />
            ))}
          </div>
        </section>

        {/* Skills */}
        <section>
          <h2 className="mb-8 text-2xl font-semibold text-foreground">Core Skills</h2>
          <Card className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(cv.skills).map(([category, skills]: [string, any]) => (
                <SkillCategory key={category} title={category} skills={skills} />
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}

function ExperienceItem({
  title,
  company,
  period,
  location,
  description,
  tech,
}: {
  title: string
  company: string
  period: string
  location: string
  description: string[]
  tech: string[]
}) {
  return (
    <div className="experience-item relative border-l-2 border-border pl-6 break-after-page">
      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-border bg-background" />
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-base font-medium text-accent">{company}</p>
        <p className="text-sm text-muted-foreground">
          {period} | {location}
        </p>
      </div>
      <ul className="mb-4 list-inside list-disc space-y-1 text-sm leading-relaxed text-foreground">
        {description.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      {tech.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tech.map((item) => (
            <Badge key={item} variant="secondary" className="text-xs font-normal">
              {item}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function SkillCategory({
  title,
  skills,
}: {
  title: string
  skills: string[]
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="outline" className="text-xs font-normal">
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  )
}
