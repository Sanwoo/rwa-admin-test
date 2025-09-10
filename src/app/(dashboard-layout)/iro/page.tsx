import { Introduction } from '@/components/Introduction'
import React from 'react'
import ProjectList from '@/components/iro/ProjectList'

const page = () => {
  return (
    <section className="container mx-auto py-8">
      <Introduction title="IRO" description="Invest in all ongoing projects in iro" />
      <ProjectList />
    </section>
  )
}

export default page
