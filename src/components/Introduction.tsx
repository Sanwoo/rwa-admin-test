import React from 'react'

export const Introduction = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="mb-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  )
}
