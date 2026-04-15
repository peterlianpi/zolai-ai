import UploadZone from "@/features/media/components/upload-zone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminMediaUploadPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Upload Media</h2>
          <p className="text-muted-foreground">
            Upload images and files to your configured media provider.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Media Uploader</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <UploadZone multiple maxSizeMB={5} />
        </CardContent>
      </Card>
    </div>
  );
}

