'use client'

import { ProjectConfigForm } from '@/components/create-project/ProjectConfigForm'
import { Introduction } from '@/components/Introduction'

const HomePage = () => {
  return (
    <section className="container mx-auto py-8">
      <Introduction title="Create Project" description="Configure all parameters and settings for RWA project" />
      <ProjectConfigForm />
    </section>
  )
}

export default HomePage
