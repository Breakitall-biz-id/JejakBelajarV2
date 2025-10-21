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

interface ClassOption {
  id: string;
  name: string;
  studentCount: number;
  status: string;
}

interface ExportStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableClasses: ClassOption[];
  onSuccess?: () => void;
}

export function ExportStudentsDialog({
  open,
  onOpenChange,
  availableClasses,
  onSuccess,
}: ExportStudentsDialogProps) {
  const [selectedClasses, setSelectedClasses] = React.useState<string[]>([]);
  const [includeCredentials, setIncludeCredentials] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  // Ensure availableClasses is always an array
  const classes = React.useMemo(() => {
    if (!availableClasses || !Array.isArray(availableClasses)) {
      return [];
    }
    return availableClasses;
  }, [availableClasses]);

  // Show loading state
  const isLoading = !availableClasses && open;

  // Reset selections when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedClasses([]);
      setIncludeCredentials(false);
    }
  }, [open]);

  const handleClassToggle = (classId: string, checked: boolean) => {
    setSelectedClasses(prev =>
      checked
        ? [...prev, classId]
        : prev.filter(id => id !== classId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClasses(classes.map(cls => cls.id));
    } else {
      setSelectedClasses([]);
    }
  };

  const handleExport = async (format: 'data' | 'credentials') => {
    if (selectedClasses.length === 0) {
      toast.error("Pilih minimal satu kelas untuk diexport");
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch('/api/admin/students/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classIds: selectedClasses,
          includeCredentials: format === 'credentials',
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from headers or create default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'data-siswa-jejakbelajar.xlsx';

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

      toast.success(`Data siswa berhasil diexport!`);
      onOpenChange(false);
      onSuccess?.();

    } catch (error) {
      toast.error("Gagal mengexport data siswa");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedCount = selectedClasses.length;
  const totalStudents = classes
    .filter(cls => selectedClasses.includes(cls.id))
    .reduce((sum, cls) => sum + cls.studentCount, 0);

  const isAllSelected = selectedClasses.length === classes.length && classes.length > 0;
  const isIndeterminate = selectedClasses.length > 0 && selectedClasses.length < classes.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Data Siswa</DialogTitle>
          <DialogDescription>
            Pilih kelas yang ingin diexport. Anda dapat memilih untuk export data biasa atau
            beserta credentials login.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Memuat data kelas...</span>
            </div>
          )}

          {/* Select All Option */}
          {!isLoading && classes.length > 0 && (
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                ref={(ref) => {
                  if (ref) {
                    ref.indeterminate = isIndeterminate;
                  }
                }}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium cursor-pointer flex-1"
              >
                Pilih Semua Kelas
              </label>
              <Badge variant="secondary">
                {classes.reduce((sum, cls) => sum + cls.studentCount, 0)} siswa
              </Badge>
            </div>
          )}

          {/* Class Selection */}
          {!isLoading && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Pilih Kelas:</label>
              {classes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Download className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Belum ada kelas dengan siswa</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {classes.map((cls) => (
                    <div
                      key={cls.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={`class-${cls.id}`}
                        checked={selectedClasses.includes(cls.id)}
                        onCheckedChange={(checked) =>
                          handleClassToggle(cls.id, checked as boolean)
                        }
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{cls.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={cls.status === 'aktif' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {cls.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {cls.studentCount} siswa
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Export Options */}
          {!isLoading && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Opsi Export:</label>
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
          )}

          {/* Selection Summary */}
          {selectedCount > 0 && (
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="text-sm font-medium text-primary">
                {selectedCount} kelas dipilih ({totalStudents} siswa)
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Format: {includeCredentials ? 'Data + Password' : 'Data Siswa'}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Batal
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExport('data')}
              disabled={selectedCount === 0 || isExporting || isLoading}
              className="gap-2"
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
              disabled={selectedCount === 0 || isExporting || isLoading}
              variant="secondary"
              className="gap-2"
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