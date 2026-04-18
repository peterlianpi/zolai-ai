'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Copy, Trash2, Plus, Key } from 'lucide-react';
import { toast } from 'sonner';
import { client } from '@/lib/api/client';

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

export function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    setLoading(true);
    try {
      const res = await client.api['api-keys'].$post({
        json: { name: newKeyName },
      });

      if (!res.ok) {
        throw new Error('Failed to generate key');
      }

      const data = await res.json() as { data: ApiKey & { key: string } };
      setGeneratedKey(data.data.key);
      setKeys([...keys, data.data]);
      setNewKeyName('');
      toast.success('API key generated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      const res = await client.api['api-keys'][':id'].$delete({
        param: { id },
      });

      if (!res.ok) {
        throw new Error('Failed to revoke key');
      }

      setKeys(keys.filter(k => k.id !== id));
      toast.success('API key revoked');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys
        </CardTitle>
        <CardDescription>
          Generate API keys for programmatic access to the API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generate New Key */}
        <div className="space-y-4 border-b pb-6">
          <div className="space-y-2">
            <Label htmlFor="key-name">Key Name</Label>
            <Input
              id="key-name"
              placeholder="e.g., Production API, Development"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          <Button
            onClick={handleGenerateKey}
            disabled={loading}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Generate New Key'}
          </Button>
        </div>

        {/* Generated Key Display */}
        {generatedKey && (
          <div className="space-y-2 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              ⚠️ Save this key securely. It will only be shown once.
            </p>
            <div className="flex gap-2">
              <code className="flex-1 bg-white dark:bg-slate-900 p-2 rounded text-sm font-mono break-all">
                {generatedKey}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(generatedKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Existing Keys */}
        {keys.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Your API Keys</h3>
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{key.name}</p>
                  <p className="text-sm text-gray-500">
                    {key.keyPreview}... • Created {new Date(key.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRevokeKey(key.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {keys.length === 0 && !generatedKey && (
          <p className="text-sm text-gray-500 text-center py-4">
            No API keys yet. Generate one to get started.
          </p>
        )}

        {/* Usage Example */}
        <div className="space-y-2 bg-gray-50 dark:bg-slate-900 p-4 rounded-lg">
          <p className="text-sm font-medium">Usage Example:</p>
          <code className="text-xs block bg-white dark:bg-slate-800 p-2 rounded overflow-x-auto">
            {`curl -X POST https://zolai.space/api/content/posts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Test"}'`}
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
