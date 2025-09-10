import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

export const ProjectListSkeleton = () => {
  return (
    <>
      {/* Project Cards Skeleton */}
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          {/* Card Header */}
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-32" /> {/* Project Name */}
                <Skeleton className="h-5 w-16" /> {/* Badge */}
              </div>
              <Skeleton className="h-8 w-8" /> {/* Copy Button */}
            </CardTitle>
            <div className="mt-2">
              <span className="flex items-center gap-2">
                <Skeleton className="h-4 w-12" /> {/* "owner:" label */}
                <Skeleton className="h-4 w-80" /> {/* Owner address */}
                <Skeleton className="h-5 w-5" /> {/* Copy icon */}
              </span>
            </div>
          </CardHeader>

          {/* Card Content - Project Details */}
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Project Detail Fields (约8-10个字段) */}
              {Array.from({ length: 8 }).map((_, fieldIndex) => (
                <div key={fieldIndex} className="space-y-1">
                  <Skeleton className="h-4 w-24" /> {/* Field Label */}
                  <Skeleton className="h-4 w-full" /> {/* Field Value */}
                </div>
              ))}
            </div>
          </CardContent>

          {/* Card Footer - Action Buttons */}
          <CardFooter className="flex flex-col items-end py-3 gap-2">
            {/* Add Whitelist Row */}
            <div className="flex items-center justify-end gap-2 w-full">
              <Skeleton className="h-6.5 max-w-70 flex-1" /> {/* Address Input */}
              <Skeleton className="h-6.5 w-28" /> {/* Add Whitelist Button */}
            </div>

            {/* Whitelist Buy Row */}
            <div className="flex items-center justify-end gap-2 w-full">
              <Skeleton className="h-6.5 max-w-70 flex-1" /> {/* Amount Input */}
              <Skeleton className="h-6.5 w-28" /> {/* Whitelist Buy Button */}
            </div>
          </CardFooter>
        </Card>
      ))}
    </>
  )
}
