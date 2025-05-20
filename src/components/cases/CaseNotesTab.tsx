
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CaseNotesTabProps {
  notes: string | null | undefined;
}

const CaseNotesTab: React.FC<CaseNotesTabProps> = ({ notes }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="whitespace-pre-line">{notes || 'No notes available for this case.'}</p>
        <Button className="mt-4" variant="outline">Edit Notes</Button>
      </CardContent>
    </Card>
  );
};

export default CaseNotesTab;
