// Parallel Workflow Orchestrator — Zolai Curriculum
import type { Department, Subdepartment, WorkflowStage, Handoff, Task, StageStatus } from './types';

// ── Parallel department workflow ──────────────────────────────────────────────
// Phase 1 (all parallel): Foundation setup for all 4 departments
// Phase 2 (pipeline):     Linguistics → Curriculum → Tutor → Assessment
// Phase 3 (parallel):     Phonics track runs independently throughout

export class ParallelWorkflowOrchestrator {
  private stages = new Map<string, WorkflowStage>();
  private handoffs: Handoff[] = [];

  // Phase 1: all departments start simultaneously
  createFoundationPhase(): WorkflowStage[] {
    const depts: Department[] = ['linguistics', 'tutor', 'phonics', 'curriculum'];
    const stages = depts.map(dept => ({
      id: `${dept}-foundation`,
      name: `${dept} Foundation`,
      department: dept,
      status: 'pending' as StageStatus,
      startDate: new Date(),
      dependencies: [],
    }));
    stages.forEach(s => this.stages.set(s.id, s));
    return stages;
  }

  // Phase 2: content pipeline per unit (linguistics → curriculum → tutor → assessment)
  createUnitPipeline(levelCode: string, unitNumber: number): WorkflowStage[] {
    const key = `${levelCode}-u${unitNumber}`;
    const stages: WorkflowStage[] = [
      { id: `ling-${key}`,  name: `[${key}] Linguistics: vocab + grammar rules`, department: 'linguistics', status: 'pending', startDate: new Date(), dependencies: ['linguistics-foundation'] },
      { id: `curr-${key}`,  name: `[${key}] Curriculum: 8 sub-unit design`,      department: 'curriculum',  status: 'pending', startDate: new Date(), dependencies: [`ling-${key}`] },
      { id: `tutor-${key}`, name: `[${key}] Tutor: intro text + hints`,           department: 'tutor',       status: 'pending', startDate: new Date(), dependencies: [`curr-${key}`] },
      { id: `asmt-${key}`,  name: `[${key}] Assessment: XP + pass thresholds`,   department: 'tutor',       status: 'pending', startDate: new Date(), dependencies: [`tutor-${key}`], subdepartment: 'assessment' },
    ];
    stages.forEach(s => this.stages.set(s.id, s));
    return stages;
  }

  // Phase 3: phonics runs in parallel — no dependency on CEFR pipeline
  createPhonicsPipeline(): WorkflowStage[] {
    const categories: Subdepartment[] = ['vowels', 'consonants', 'clusters', 'tones', 'minimal-pairs'];
    const stages = categories.map(cat => ({
      id: `phonics-${cat}`,
      name: `Phonics: ${cat}`,
      department: 'phonics' as Department,
      subdepartment: cat,
      status: 'pending' as StageStatus,
      startDate: new Date(),
      dependencies: ['phonics-foundation'],
    }));
    stages.forEach(s => this.stages.set(s.id, s));
    return stages;
  }

  async executeStage(stageId: string): Promise<boolean> {
    const stage = this.stages.get(stageId);
    if (!stage) return false;
    const allDone = stage.dependencies.every(d => this.stages.get(d)?.status === 'completed');
    if (!allDone) { stage.status = 'blocked'; return false; }
    stage.status = 'in_progress';
    stage.status = 'completed';
    stage.endDate = new Date();
    this.triggerHandoff(stageId);
    return true;
  }

  private triggerHandoff(fromId: string) {
    const from = this.stages.get(fromId);
    if (!from) return;
    const seq: Department[] = ['linguistics', 'curriculum', 'tutor'];
    const next = seq[seq.indexOf(from.department) + 1];
    if (!next) return;
    this.handoffs.push({
      id: `hoff-${fromId}`,
      fromDepartment: from.department,
      toDepartment: next,
      artifact: from.name,
      status: 'in_progress',
      date: new Date(),
    });
  }

  getStatus() {
    const all = [...this.stages.values()];
    return {
      total: all.length,
      completed: all.filter(s => s.status === 'completed').length,
      inProgress: all.filter(s => s.status === 'in_progress').length,
      pending: all.filter(s => s.status === 'pending').length,
      blocked: all.filter(s => s.status === 'blocked').length,
    };
  }

  getHandoffs() { return this.handoffs; }
  getDeptStages(dept: Department) { return [...this.stages.values()].filter(s => s.department === dept); }
}

// ── Task manager ──────────────────────────────────────────────────────────────

export class SubdepartmentTaskManager {
  private tasks = new Map<string, Task>();

  create(subdepartment: Subdepartment, name: string, assignee: string, dueDate: Date): Task {
    const task: Task = { id: `task-${Date.now()}`, subdepartment, name, assignee, dueDate, status: 'pending', createdAt: new Date() };
    this.tasks.set(task.id, task);
    return task;
  }

  bySubdept(subdepartment: Subdepartment) { return [...this.tasks.values()].filter(t => t.subdepartment === subdepartment); }
  updateStatus(id: string, status: StageStatus) { const t = this.tasks.get(id); if (t) t.status = status; return !!t; }
  overdue() { const now = new Date(); return [...this.tasks.values()].filter(t => t.dueDate < now && t.status !== 'completed'); }
}
