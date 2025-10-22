"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Loader2 } from "lucide-react";

export function ExportTeachersDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [includeCredentials, setIncludeCredentials] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  // Reset selections when dialog opens
  React.useEffect(() => {
    if (open) {
      setIncludeCredentials(false);
    }
  }, [open]);

  const handleExport = async (format: 'data' | 'credentials') => {
    setIsExporting(true);

    try {
      const response = await fetch('/api/admin/teachers/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeCredentials: format === 'credentials',
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from headers or create default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = format === 'credentials' ? 'credentials-guru-jejakbelajar.xlsx' : 'data-guru-jejakbelajar.xlsx';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      const successMessage = format === 'credentials'
        ? 'Data guru beserta password berhasil diexport!'
        : 'Data guru berhasil diexport!';

      toast.success(successMessage);
      onOpenChange(false);
      onSuccess?.();

    } catch (error) {
      toast.error("Gagal mengexport data guru");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Data Guru</DialogTitle>
          <DialogDescription>
            Pilih format export untuk data guru. Anda dapat memilih untuk export data biasa atau beserta credentials login.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <Checkbox
                  id="include-credentials"
                  checked={includeCredentials}
                  onCheckedChange={(checked) =>
                    setIncludeCredentials(checked as boolean)
                  }
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">Include Password</div>
                  <div className="text-xs text-muted-foreground">
                    Export data beserta password default untuk login
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
            <div className="font-medium mb-1">Informasi:</div>
            <ul className="text-xs space-y-1">
              <li>• Password default: jejakbelajar123</li>
              <li>• Format: Data guru atau Data + Password</li>
              <li>• File: Excel (.xlsx)</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Batal
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => handleExport('data')}
              disabled={isExporting}
              className="gap-2 flex-1 sm:flex-none"
            >
              {isExporting && !includeCredentials ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export Data
            </Button>
            <Button
              onClick={() => handleExport('credentials')}
              disabled={isExporting}
              variant="secondary"
              className="gap-2 flex-1 sm:flex-none"
            >
              {isExporting && includeCredentials ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export + Password
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}