'use client';

import { useState } from 'react';
import { MediaUploader } from '@/components/MediaUploader';
import { MediaGallery } from '@/components/MediaGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MediaPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [resourceType, setResourceType] = useState<'image' | 'video' | 'all'>('all');

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Media Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload, manage, and organize your images and videos with Cloudinary
          </p>
        </div>

        <div className="grid gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Media</CardTitle>
              <CardDescription>
                Drag and drop or click to upload images and videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaUploader onUploadSuccess={handleUploadSuccess} />
            </CardContent>
          </Card>

          {/* Gallery Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Media</CardTitle>
              <CardDescription>
                View, manage, and organize all your uploaded media files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="all"
                onValueChange={(value) =>
                  setResourceType(value as 'image' | 'video' | 'all')
                }
                className="mb-6"
              >
                <TabsList>
                  <TabsTrigger value="all">All Media</TabsTrigger>
                  <TabsTrigger value="image">Images</TabsTrigger>
                  <TabsTrigger value="video">Videos</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <MediaGallery
                    resourceType="all"
                    refreshTrigger={refreshTrigger}
                  />
                </TabsContent>

                <TabsContent value="image" className="mt-6">
                  <MediaGallery
                    resourceType="image"
                    refreshTrigger={refreshTrigger}
                  />
                </TabsContent>

                <TabsContent value="video" className="mt-6">
                  <MediaGallery
                    resourceType="video"
                    refreshTrigger={refreshTrigger}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
