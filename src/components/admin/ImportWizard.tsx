// Admin Import Wizard - drag & drop upload with validation and preview
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  preview: any[];
  totalRows: number;
  validRows: number;
}

interface ImportWizardProps {
  onImportComplete: (type: string, snapshot: any) => void;
}

export function ImportWizard({ onImportComplete }: ImportWizardProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedType, setSelectedType] = useState<string>('elections');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState<'upload' | 'validate' | 'preview' | 'complete'>('upload');

  const dataTypes = [
    { value: 'elections', label: 'Elections', description: 'Election metadata and schedules' },
    { value: 'candidates', label: 'Candidates', description: 'Candidate lists and party affiliations' },
    { value: 'polling-units', label: 'Polling Units', description: 'Voting locations and ward mapping' },
    { value: 'deadlines', label: 'Deadlines', description: 'Important dates and registration deadlines' }
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setStep('validate');
    validateFiles(acceptedFiles[0]);
  }, [selectedType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  const validateFiles = async (file: File) => {
    if (!file) return;

    try {
      const text = await file.text();
      let data: any[];

      // Parse file based on type
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        data = parseCSV(text);
      } else {
        throw new Error('Unsupported file format');
      }

      // Validate structure
      const result = validateData(data, selectedType);
      setValidation(result);
      setStep('preview');
    } catch (error) {
      setValidation({
        valid: false,
        errors: [`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        preview: [],
        totalRows: 0,
        validRows: 0
      });
      setStep('preview');
    }
  };

  const parseCSV = (csv: string): any[] => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  };

  const validateData = (data: any[], type: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let validRows = 0;

    if (!Array.isArray(data)) {
      errors.push('Data must be an array');
      return { valid: false, errors, warnings, preview: [], totalRows: 0, validRows: 0 };
    }

    // Validate each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowErrors = validateRow(row, type, i + 1);
      
      if (rowErrors.length === 0) {
        validRows++;
      } else {
        errors.push(...rowErrors);
      }
    }

    const valid = errors.length === 0 && validRows > 0;
    return {
      valid,
      errors,
      warnings,
      preview: data.slice(0, 5),
      totalRows: data.length,
      validRows
    };
  };

  const validateRow = (row: any, type: string, rowNumber: number): string[] => {
    const errors: string[] = [];

    switch (type) {
      case 'elections':
        if (!row.name) errors.push(`Row ${rowNumber}: Missing election name`);
        if (!row.date) errors.push(`Row ${rowNumber}: Missing election date`);
        break;
      case 'candidates':
        if (!row.name) errors.push(`Row ${rowNumber}: Missing candidate name`);
        if (!row.party) errors.push(`Row ${rowNumber}: Missing party`);
        break;
      case 'polling-units':
        if (!row.name) errors.push(`Row ${rowNumber}: Missing polling unit name`);
        if (!row.code) errors.push(`Row ${rowNumber}: Missing code`);
        break;
    }

    return errors;
  };

  const handleImport = async () => {
    if (!files[0] || !validation?.valid) return;

    setImporting(true);
    try {
      // In real implementation, this would call the manual provider
      const snapshot = {
        id: `import_${Date.now()}`,
        type: selectedType,
        filename: files[0].name,
        rowCount: validation.validRows,
        timestamp: new Date().toISOString(),
        status: 'active'
      };

      onImportComplete(selectedType, snapshot);
      setStep('complete');
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setValidation(null);
    setStep('upload');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Data Import Wizard</CardTitle>
        <CardDescription>
          Upload CSV, JSON, or XLSX files to import election data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Type Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Data Type</label>
          <div className="grid grid-cols-2 gap-4">
            {dataTypes.map((type) => (
              <Card 
                key={type.value}
                className={`cursor-pointer transition-colors ${
                  selectedType === type.value ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedType(type.value)}
              >
                <CardContent className="p-4">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-muted-foreground">{type.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* File Upload */}
        {step === 'upload' && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-muted-foreground mb-4">
              Supports CSV, JSON, and XLSX files
            </p>
            <Button variant="secondary">Browse Files</Button>
          </div>
        )}

        {/* Validation Results */}
        {step === 'preview' && validation && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {validation.valid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {validation.valid ? 'Validation Passed' : 'Validation Failed'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{validation.totalRows}</div>
                  <div className="text-sm text-muted-foreground">Total Rows</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{validation.validRows}</div>
                  <div className="text-sm text-muted-foreground">Valid Rows</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{validation.errors.length}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </CardContent>
              </Card>
            </div>

            {validation.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">Validation Errors:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validation.errors.slice(0, 5).map((error, i) => (
                      <li key={i} className="text-sm">{error}</li>
                    ))}
                    {validation.errors.length > 5 && (
                      <li className="text-sm">... and {validation.errors.length - 5} more</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validation.preview.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Data Preview</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-muted">
                        {Object.keys(validation.preview[0]).map((key) => (
                          <th key={key} className="border p-2 text-left text-sm font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {validation.preview.map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((value, j) => (
                            <td key={j} className="border p-2 text-sm">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={reset} variant="outline">
                Start Over
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={!validation.valid || importing}
              >
                {importing ? 'Importing...' : 'Import Data'}
              </Button>
            </div>
          </div>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Import Complete!</h3>
            <p className="text-muted-foreground mb-4">
              Successfully imported {validation?.validRows} rows of {selectedType} data
            </p>
            <Button onClick={reset}>Import More Data</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}