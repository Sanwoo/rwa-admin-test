import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export const ProjectConfigFormSkeleton = () => {
  return (
    <>
      {/* Config buttons skeleton */}
      <div className="flex space-x-4 mb-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="space-y-8">
        {/* Project Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-24" />
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              <Skeleton className="h-4 w-48" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" /> {/* Label */}
                <Skeleton className="h-10 w-full" /> {/* Input */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tokens Config Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              <Skeleton className="h-4 w-72" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 6 input fields for tokens config */}
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-20" /> {/* Label */}
                  <Skeleton className="h-10 w-full" /> {/* Input */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bank Config Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-28" />
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 2 input fields for bank config */}
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-16" /> {/* Label */}
                  <Skeleton className="h-10 w-full" /> {/* Input */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Price Config Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-40" />
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              <Skeleton className="h-4 w-56" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 7 input fields for market price config */}
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-20" /> {/* Label */}
                  <Skeleton className="h-10 w-full" /> {/* Input */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
