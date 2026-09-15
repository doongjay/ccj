from pathlib import Path
from datetime import datetime,timezone
import json,collections
root=Path(__file__).resolve().parents[1]
def cases(d):
 out=[]
 def walk(s):
  for sp in s.get('specs',[]):
   for t in sp['tests']:out.append({'file':sp['file'],'title':sp['title'],'project':t.get('projectName',''),'classification':t['status'],'expectedStatus':t['expectedStatus'],'annotations':t.get('annotations',[]),'results':t['results']})
  for child in s.get('suites',[]):walk(child)
 for s in d['suites']:walk(s)
 return out
executions={}
for p in sorted((root/'logs').glob('*.json')):
 d=json.loads(p.read_text())
 if 'suites' not in d:continue
 cc=cases(d);counts=collections.Counter(c['results'][-1]['status'] if c['results'] else 'notRun' for c in cc)
 executions[p.name]={'reporter':str(p.relative_to(root)),'statsAsReported':d['stats'],'actualLastStatuses':dict(counts),'errors':d['errors'],'tests':cc}
initial=executions['dev-regression-01.json']['tests'];latest={(c['file'],c['title']):c for c in initial}
for name in ['jaw-rerun-01.json','preserved-ux-rerun-01.json']:
 for c in executions[name]['tests']:latest[(c['file'],c['title'])]=c
assert len(latest)==34 and all(c['classification']=='expected' for c in latest.values())
for n in ['art-07.json','capture-final-02.json','production-01.json']:
 assert all(c['classification']=='expected' for c in executions[n]['tests']),n
assert len(executions['production-01.json']['tests'])==32
perf={};loading={}
for route in ['car','subway']:
 p=f'regressions/performance-{route}.json';d=json.loads((root/p).read_text())
 perf[route]={'reporter':p,'opening':{k:d['opening'][k] for k in ['totalResponseBytes','gameAssetBytes','elapsedMs']},'previousOpeningBytes':3514909,'deltaBytes':d['opening']['totalResponseBytes']-3514909,'under5MB':d['opening']['totalResponseBytes']<=5000000,'errors':d['errors']}
 p=f'after/neck-loading-ux/loading-{route}.json';d=json.loads((root/p).read_text());events=[x for x in d['records'] if x['type']=='loading']
 loading[route]={'reporter':p,'boot':sum(x['class']=='stage-loading' for x in events),'inline':sum(x['class']=='stage-loading-inline' for x in events),'postBootBlocking':sum(x['class']=='stage-loading' and x.get('stage')!='opening' for x in events),'errors':d['errors']}
asset=json.loads((root/'assets-final-01.json').read_text());fp=json.loads((root/'source-fingerprint.json').read_text())
data={'timeUTC':datetime.now(timezone.utc).isoformat(),'summary':{'developmentCoverage':{'passed':34,'failed':0,'intentionalSkips':0,'note':'Coverage from initial run plus explicitly preserved jaw and nine UX reruns, not a single all-green full execution. This is a relevant 34-test subset, not the old entire 115-test suite.'},'production':executions['production-01.json']['statsAsReported'],'finalCapture':executions['capture-final-02.json']['statsAsReported'],'finalNativeArt':executions['art-07.json']['statsAsReported'],'beforeFlows':executions['before-flows.json']['statsAsReported']},'sourceFingerprint':fp['fingerprint'],'applicationFingerprint':fp['applicationFingerprint'],'executions':executions,'developmentResolvedTests':list(latest.values()),'intentionalSkips':[],'notRunIsNotIntentionalSkip':True,'build':{'command':'npm run build','exitCode':0,'log':'logs/build-03.log','warnings':'Vite large main chunk warning retained; build thresholds not changed.'},'typecheck':{'command':'npm run typecheck:e2e','exitCode':0,'log':'logs/typecheck-final.log'},'assets':{'command':'npm run verify:assets -- --report ../docs/game-review/minimi-silhouette-fix/assets-final-01.json','cwd':'/Users/user/wedding/ccj/game','exitCode':0,'log':'logs/assets-final-01.log','report':'assets-final-01.json','registered':asset['registered'],'checked':asset['checked'],'decoded':asset['decoded'],'runtimeKeys':asset['runtimeKeys'],'errors':asset['errors'],'separateFromPlaywrightCounts':True},'performance':perf,'loading':loading,'visualScope':{'frontRendered':108,'frontVisuallyInspected':108,'motionRepresentatives':13,'framesPerMotionRepresentative':19,'actualGameJourneysAfter':7,'actualGameJourneysBefore':3,'uiViewports':[[320,568],[393,852],[430,932],[1440,900]],'noPhysicalMobileDeviceTesting':True,'qualityNotInferredFromIdleEquality':True}}
(root/'TEST_RESULTS.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(data['summary'],indent=2))
