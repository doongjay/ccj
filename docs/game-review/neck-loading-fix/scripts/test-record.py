"""Record complete reporter results without erasing earlier failures."""
from pathlib import Path
from datetime import datetime,timezone
import json, collections
root=Path(__file__).resolve().parents[1]
def read(p): return json.loads((root/p).read_text())
def cases(data):
    out=[]
    def walk(s):
        for sp in s.get('specs',[]):
            for t in sp['tests']:
                out.append({'file':sp['file'],'title':sp['title'],'project':t['projectName'],'classification':t['status'],'expectedStatus':t['expectedStatus'],'annotations':t.get('annotations',[]),'results':t['results']})
        for child in s.get('suites',[]): walk(child)
    for s in data['suites']:walk(s)
    return out
fullpath='regressions/logs/regression-1789392785505.json'
targetpath='regressions/logs/regression-1789394353050.json'
capturepath='logs/capture-1789392554477.json'
nativepath='logs/capture-1789393457174.json'
openingpath='logs/capture-1789394900681.json'
prodpaths=sorted((root/'regressions/logs').glob('production-*.json'))
assert prodpaths,'Production must finish before packaging'
prodpath=str(prodpaths[-1].relative_to(root))
paths=[fullpath,targetpath,capturepath,nativepath,openingpath,prodpath]
executions={p:{'reporter':p,'stats':read(p)['stats'],'errors':read(p)['errors'],'tests':cases(read(p))} for p in paths}
full=executions[fullpath]['tests'];target=executions[targetpath]['tests']
assert sum(t['classification']=='expected' for t in full)==106
assert len(target)==6 and all(t['classification']=='expected' for t in target)
aliases={'manual buffet photos never auto-advance or accidentally finish the meal':'buffet touch reveals all photos and waits for a separate meal completion input'}
resolved=[]
for f in full:
    if f['classification']!='unexpected':continue
    matched=[t for t in target if t['file']==f['file'] and t['title']==aliases.get(f['title'],f['title']) and t['project']==f['project']]
    assert len(matched)==1,(f['file'],f['title'])
    resolved.append({'originalFile':f['file'],'originalTitle':f['title'],'originalResults':[r['status'] for r in f['results']],'retestedTitle':matched[0]['title'],'retestedStatus':'passed','originalReporter':fullpath,'retestReporter':targetpath})
history=[]
for p in sorted(list((root/'logs').glob('capture-*.json'))+list((root/'regressions/logs').glob('*.json'))):
    d=json.loads(p.read_text())
    if 'suites' not in d or 'stats' not in d: continue
    cc=cases(d); counts=collections.Counter()
    for c in cc:
        results=c['results']
        if not results:counts['notRun']+=1
        else:counts[results[-1]['status']]+=1
    history.append({'reporter':str(p.relative_to(root)),'statsAsReported':d['stats'],'lastAttemptStatuses':dict(counts),'warning':'In interrupted runs, reporter.stats.skipped includes unexecuted tests. It is not the intentional three production-only skips.'})
perf={}
for route in ['car','subway']:
    p='regressions/regressions/performance-'+route+'.json';d=read(p)
    perf[route]={'report':p,'openingTotalResponseBytes':d['opening']['totalResponseBytes'],'openingAssetResponseBytes':d['opening']['gameAssetBytes'],'elapsedMs':d['opening']['elapsedMs'],'firstLobbyTotalResponseBytes':d['firstLobby']['totalResponseBytes'],'immediateBaselineTotalResponseBytes':3513993,'deltaVsImmediateBaselineBytes':d['opening']['totalResponseBytes']-3513993,'underFiveMillionBytes':d['opening']['totalResponseBytes']<=5000000,'assetBytesUnchangedFromImmediateBaseline':d['opening']['gameAssetBytes']==3094744,'lateAssetsBeforeOpening':d['lateAssetsBeforeOpening'],'unselectedRouteAssetsByFirstLobby':d['unselectedRouteAssetsByFirstLobby'],'errors':d['errors']}
loading={}
for route in ['car','subway']:
    p='after/ux/loading-'+route+'.json';d=read(p);rr=[r for r in d['records'] if r['type']=='loading']
    loading[route]={'report':p,'bootModalCount':sum(r['class']=='stage-loading' for r in rr),'inlineCount':sum(r['class']=='stage-loading-inline' for r in rr),'postBootBlockingModalCount':sum(r['class']=='stage-loading' and r.get('stage')!='opening' for r in rr),'errors':d['errors']}
fp=read('source-fingerprint.json');previous=read('iterations/source-fingerprint-before-test-expectation-updates.json')
assert fp['applicationFingerprint']==previous['applicationFingerprint']
asset=read('assets-final.json')
out={'generatedUTC':datetime.now(timezone.utc).isoformat(),'summary':{'fullRegression':executions[fullpath]['stats'],'targetedRetest':executions[targetpath]['stats'],'resolvedCoverage':{'passed':112,'intentionalDevSkips':3,'unresolvedFailures':0,'meaning':'Aggregate full-run coverage plus six explicitly mapped retests on identical application source; NOT a single all-green full-suite execution.'},'artifactCapture':executions[capturepath]['stats'],'nativeLines':executions[nativepath]['stats'],'manualPlayServerOpening':executions[openingpath]['stats'],'production':executions[prodpath]['stats']},'applicationFingerprint':fp['applicationFingerprint'],'fullRunApplicationFingerprintEvidence':'iterations/source-fingerprint-before-test-expectation-updates.json','sameApplicationForFullRunAndRetest':True,'sourceFingerprint':fp['fingerprint'],'failureResolution':resolved,'intentionalSkips':[t for t in full if t['classification']=='skipped'],'executions':executions,'allHistoricalReporters':history,'build':{'command':'npm run build','exitCode':0,'log':'logs/build-final-02.log'},'typecheck':{'command':'npm run typecheck:e2e','exitCode':0,'log':'logs/typecheck-final.log'},'assetInspection':{'command':'npm run verify:assets -- --report ../docs/game-review/neck-loading-fix/assets-final.json','cwd':'/Users/user/wedding/ccj/game','exitCode':0,'log':'logs/assets-final.log','report':'assets-final.json','registered':asset['registered'],'checked':asset['checked'],'decoded':asset['decoded'],'runtimeKeys':asset['runtimeKeys'],'preservedSources':asset['preservedSources'],'old40Tracked':asset['old40Tracked'],'errors':asset['errors'],'notIncludedInPlaywrightPassCounts':True},'performance':perf,'loading':loading,'limitations':['Real Chromium with touch emulation, not physical iOS/Android devices.','Original first-notebook-to-photo-booth report was not reproduced before or after; async panel opening was hardened.','108 actual front renders visually inspected; seven complete representative minimi flows, not 108 complete journeys.','Opening transfer is 916 bytes (+0.0261%) above the immediate previous build; assets unchanged. Local unthrottled single measurements do not prove a speed improvement.']}
assert executions[prodpath]['stats']['unexpected']==0
(root/'TEST_RESULTS.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(out['summary'],indent=2))
