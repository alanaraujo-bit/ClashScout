import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { createVacancyAction } from '../../actions';
import { VacancyForm } from '../../vacancy-form';

export default function NewVacancyPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova vaga</h1>
        <p className="text-sm text-[var(--color-ink-muted)]">
          A vaga nasce como rascunho - publique quando estiver pronta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhes da vaga</CardTitle>
        </CardHeader>
        <CardContent>
          <VacancyForm action={createVacancyAction} submitLabel="Criar vaga" />
        </CardContent>
      </Card>
    </div>
  );
}
