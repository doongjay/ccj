from pathlib import Path
from collections import Counter
import hashlib, json

root=Path(__file__).resolve().parents[1]
def summarize(path):
    data=json.loads(path.read_text());cases=[]
    def attachment(a):
        # The original JSON reporter retains every embedded body. The summary
        # references it instead of duplicating screenshots/large audit payloads.
        result={k:v for k,v in a.items() if k!='body'}
        if 'body' in a:
            body=a['body'] if isinstance(a['body'],str) else json.dumps(a['body'])
            result.update({'embeddedBodyTextLength':len(body),'embeddedBodyTextSha256':hashlib.sha256(body.encode()).hexdigest(),'fullBodyInRawReporter':str(path.relative_to(root))})
        return result
    def walk(s):
        for spec in s.get('specs',[]):
            for test in spec['tests']:
                results=test.get('results',[])
                cases.append({'file':spec.get('file'),'line':spec.get('line'),'title':spec['title'],'project':test['projectName'],'expectedStatus':test.get('expectedStatus'),'status':test.get('status'),'annotations':test.get('annotations',[]),'attempts':[{'status':r['status'],'retry':r.get('retry'),'durationMs':r.get('duration'),'startTime':r.get('startTime'),'errors':r.get('errors',[]),'attachments':[attachment(a) for a in r.get('attachments',[])]} for r in results],'lastStatus':results[-1]['status'] if results else 'did-not-run'})
        for child in s.get('suites',[]):walk(child)
    walk(data)
    counts=dict(Counter(c['lastStatus'] for c in cases))
    return {'reporter':str(path.relative_to(root)),'stats':data['stats'],'caseCount':len(cases),'lastResultCounts':counts,'globalErrors':data.get('errors',[]),'cases':cases}

reports=[('before','logs/before.json'),('iteration-01','logs/iteration-01.json'),('iteration-02','logs/iteration-02.json'),('flows-01','logs/flows-01.json'),('motion-01','logs/motion-01.json'),('regression-interim','logs/regression-final-iteration02.json'),('production-interim','logs/production-final-iteration02.json'),('iteration-03','logs/iteration-03.json'),('motion-02','logs/motion-02.json'),('motion-final','logs/motion-03.json'),('capture-final','logs/final-capture.json'),('flows-final','logs/flows-final.json'),('regression-final','regressions/logs/regression-final-02.json'),('production-final','regressions/logs/production-final-02.json')]
runs={name:summarize(root/path) for name,path in reports if (root/path).exists()}
for name,run in runs.items():
    run['observedCommandExitCode']=130 if name in ['regression-interim','production-interim'] else 0
main=[runs[x] for x in ['regression-final','production-final'] if x in runs]
counts=Counter()
for r in main:counts.update(r['lastResultCounts'])
skips=[]
if len(main)==2:
    for case in main[0]['cases']:
        if case['lastStatus']=='skipped':
            other=next(c for c in main[1]['cases'] if c['title']==case['title'])
            skips.append({'title':case['title'],'project':case['project'],'annotations':case['annotations'],'correspondingProductionStatus':other['lastStatus'],'productionProject':other['project']})
assets=json.loads((root/'assets-final-03.json').read_text())
summary={'scope':'Main dev/production project-case counts; separate final minimi capture/flow/motion are not added to main count. Automatic pass is not art-quality approval.','finalComplete':len(main)==2,'main':{'projectCases':sum(r['caseCount'] for r in main),'counts':dict(counts)},'skipDetails':skips,'build':{'command':'npm run build','workdir':'game','exitCode':0,'log':'logs/build-final.log','includes':'app TypeScript, e2e TypeScript, Vite production build; existing large-chunk warning retained'},'shippingSeparate':{k:assets[k] for k in ['mode','registered','checked','decoded','runtimeKeys','preservedSources','old40Tracked','errors','exitCode']},'runs':runs}
(root/'TEST_SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'finalComplete':summary['finalComplete'],'runs':{k:v['lastResultCounts'] for k,v in runs.items()}},ensure_ascii=False))

perf=[]
for route in ['car','subway']:
    source=root/f'regressions/regressions/performance-{route}.json'
    if not source.exists():continue
    d=json.loads(source.read_text())
    # Ignore an earlier unfinished production run, using timestamps from the final reporter.
    if 'production-final' not in runs:continue
    started=runs['production-final']['stats']['startTime']
    if d['measuredAt']<started:continue
    dp=Path(__file__).resolve().parents[2]/f'after-batch-d/regressions/performance-{route}.json'
    prior=json.loads(dp.read_text())
    entry={'route':route,'finalSource':str(source.relative_to(root)),'DSource':str(dp),'measurement':d['measurement'],'coldCache':d['coldCache'],'production':d['production'],'opening':d['opening'],'firstLobby':d['firstLobby'],'errors':d['errors'],'failures':d['failures'],'lateAssetsBeforeOpening':d['lateAssetsBeforeOpening'],'unselectedRouteAssetsByFirstLobby':d['unselectedRouteAssetsByFirstLobby']}
    for stage in ['opening','firstLobby']:
        entry[stage+'Comparison']={'DTotalBytes':prior[stage]['totalResponseBytes'],'finalTotalBytes':d[stage]['totalResponseBytes'],'deltaTotalBytes':d[stage]['totalResponseBytes']-prior[stage]['totalResponseBytes'],'DAssetBytes':prior[stage]['gameAssetBytes'],'finalAssetBytes':d[stage]['gameAssetBytes'],'deltaAssetBytes':d[stage]['gameAssetBytes']-prior[stage]['gameAssetBytes']}
    perf.append(entry)
if len(perf)==2:(root/'PERFORMANCE_COMPARISON.json').write_text(json.dumps({'baseline':'completed D; raw legacy test also reports its unchanged hardcoded C baseline','measurementLimitation':'Local unlimited network Chromium; wall-clock time is not a real mobile network guarantee','routes':perf},ensure_ascii=False,indent=2)+'\n')
