import { useState, useEffect } from 'react';
import { flowsApi } from '../services/api';

export default function FlowEditor() {
  const [flows, setFlows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    try { const r = await flowsApi.getAll(); setFlows(r.data); } catch (e) {}
  }

  async function seed() { await flowsApi.seed(); load(); }
  async function toggle(id) { await flowsApi.toggle(id); load(); }
  async function del(id) { if (confirm('Delete?')) { await flowsApi.delete(id); load(); } }

  async function save(data) {
    if (editing) await flowsApi.update(editing._id, data);
    else await flowsApi.create(data);
    setShowForm(false); setEditing(null); load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🔄 Flows</h2>
        <div className="flex gap-2">
          {flows.length === 0 && <button onClick={seed} className="bg-gray-500 text-white px-3 py-2 rounded text-sm">Load Samples</button>}
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-[#25D366] text-white px-3 py-2 rounded text-sm">+ New</button>
        </div>
      </div>

      {showForm && <FlowForm flow={editing} onSave={save} onCancel={() => { setShowForm(false); setEditing(null); }} />}

      {flows.map(f => (
        <div key={f._id} className="bg-white rounded-lg shadow border p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{f.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${f.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {f.active ? 'On' : 'Off'}
                </span>
              </div>
              <p className="text-sm text-gray-500">Trigger: <code className="bg-gray-100 px-1 rounded">{f.trigger}</code> ({f.triggerType}) • {f.steps?.length || 0} steps</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => toggle(f._id)} className="text-xs px-2 py-1 rounded bg-gray-100">{f.active ? '⏸' : '▶'}</button>
              <button onClick={() => { setEditing(f); setShowForm(true); }} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600">Edit</button>
              <button onClick={() => del(f._id)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600">Del</button>
            </div>
          </div>
        </div>
      ))}

      {flows.length === 0 && !showForm && (
        <div className="bg-white rounded-lg shadow p-8 text-center border">
          <p className="text-4xl mb-2">🔄</p>
          <p className="text-gray-500 text-sm">"Load Samples" click cheytha sample flows load aakum</p>
        </div>
      )}
    </div>
  );
}



function FlowForm({ flow, onSave, onCancel }) {
  const [name, setName] = useState(flow?.name || '');
  const [trigger, setTrigger] = useState(flow?.trigger || '');
  const [triggerType, setTriggerType] = useState(flow?.triggerType || 'keyword');
  const [steps, setSteps] = useState(flow?.steps || [{ id: 'step1', message: '', options: [] }]);

  function addStep() { setSteps([...steps, { id: `step${steps.length + 1}`, message: '', options: [] }]); }
  function removeStep(i) { if (steps.length > 1) setSteps(steps.filter((_, idx) => idx !== i)); }
  function updateStep(i, f, v) { const s = [...steps]; s[i] = { ...s[i], [f]: v }; setSteps(s); }
  function addOption(si) { const s = [...steps]; s[si].options = [...(s[si].options || []), { match: '', nextStep: '', label: '' }]; setSteps(s); }
  function updateOption(si, oi, f, v) { const s = [...steps]; s[si].options[oi] = { ...s[si].options[oi], [f]: v }; setSteps(s); }
  function removeOption(si, oi) { const s = [...steps]; s[si].options = s[si].options.filter((_, i) => i !== oi); setSteps(s); }

  function submit(e) { e.preventDefault(); onSave({ name, trigger, triggerType, steps, active: flow?.active ?? true }); }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-4">
        <div className="p-4 border-b bg-[#075E54] text-white rounded-t-lg flex justify-between">
          <h3 className="font-bold">{flow ? 'Edit Flow' : 'New Flow'}</h3>
          <button onClick={onCancel}>✕</button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 p-2 border rounded text-sm" placeholder="Welcome Flow" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select value={triggerType} onChange={e => setTriggerType(e.target.value)} className="w-full mt-1 p-2 border rounded text-sm">
                <option value="keyword">Keyword (exact)</option>
                <option value="contains">Contains</option>
                <option value="regex">Regex</option>
                <option value="default">Default</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Trigger</label>
            <input value={trigger} onChange={e => setTrigger(e.target.value)} required className="w-full mt-1 p-2 border rounded text-sm" placeholder="hi" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm">Steps</h4>
              <button type="button" onClick={addStep} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">+ Step</button>
            </div>
            {steps.map((step, si) => (
              <div key={si} className="border rounded p-3 bg-gray-50">
                <div className="flex justify-between mb-2">
                  <input value={step.id} onChange={e => updateStep(si, 'id', e.target.value)} className="p-1 border rounded text-xs w-24" placeholder="step_id" />
                  {steps.length > 1 && <button type="button" onClick={() => removeStep(si)} className="text-xs text-red-500">Remove</button>}
                </div>
                <textarea value={step.message} onChange={e => updateStep(si, 'message', e.target.value)} rows={3} className="w-full p-2 border rounded text-sm" placeholder="Reply message..." />
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Options:</span>
                    <button type="button" onClick={() => addOption(si)} className="text-xs text-green-600">+ Option</button>
                  </div>
                  {step.options?.map((opt, oi) => (
                    <div key={oi} className="flex gap-1 items-center">
                      <input value={opt.match} onChange={e => updateOption(si, oi, 'match', e.target.value)} className="flex-1 p-1 border rounded text-xs" placeholder="Match (1)" />
                      <input value={opt.nextStep} onChange={e => updateOption(si, oi, 'nextStep', e.target.value)} className="flex-1 p-1 border rounded text-xs" placeholder="Next step" />
                      <button type="button" onClick={() => removeOption(si, oi)} className="text-red-500 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-3 border-t">
            <button type="submit" className="flex-1 bg-[#25D366] text-white py-2 rounded font-medium">💾 Save</button>
            <button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
