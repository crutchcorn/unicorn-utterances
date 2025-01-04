---
{
	title: "React Internals: Understanding the Reconciler",
	description: "",
	published: '2023-05-05T13:45:00.284Z',
	authors: ['crutchcorn'],
	tags: ['react'],
	attached: [],
	license: 'cc-by-nc-sa-4'
}
---

React 18.2.0 source code: https://github.com/facebook/react/tree/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e

**Only focusing on React DOM code**



````jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
````



- `createRoot`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-dom/src/client/ReactDOMRoot.js#L166
  - `createContainer`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-dom/src/client/ReactDOMRoot.js#L224-L233
    - https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberReconciler.new.js#L247-L271
    - `createFiberRoot`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberRoot.new.js#L134
    - `new FiberRootNode`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberRoot.new.js#L52-L132
  - `new ReactDOMRoot`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-dom/src/client/ReactDOMRoot.js#L242
    - https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-dom/src/client/ReactDOMRoot.js#L88-L90

- `render`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-dom/src/client/ReactDOMRoot.js#L92
  - `updateContainer`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-dom/src/client/ReactDOMRoot.js#L134
- `updateContainer`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberReconciler.new.js#L321
  - `createUpdate`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberReconciler.new.js#L362-L365
    - Assigns `element` to be rendered in update context
  - `enqueUpdate`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberReconciler.new.js#L381
    - `enqueueConcurrentClassUpdate`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberClassUpdateQueue.new.js#L264
    - https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberConcurrentUpdates.old.js#L120-L124 (why `.old`?)
  - ` scheduleUpdateOnFiber`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L533
  - ` ensureRootIsScheduled`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L640
  - `newCallbackNode`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L817-L820
  - `scheduleCallback`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L47
  - `Schedule.`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/Scheduler.js#L16
  - `scheduler` package: https://github.com/facebook/react/tree/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/scheduler
- `unstable_scheduleCallback`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/scheduler/src/forks/Scheduler.js#L308
  - `requestHostTimeout`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/scheduler/src/forks/Scheduler.js#L370
  - `callback` (which is `handleTimeout`): https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/scheduler/src/forks/Scheduler.js#L592
  - `handleTimeout`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/scheduler/src/forks/Scheduler.js#L130
  - `flushWork`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/scheduler/src/forks/Scheduler.js#L137
  - `workLoop`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/scheduler/src/forks/Scheduler.js#L176
  - `while (currentTask !== null)`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/scheduler/src/forks/Scheduler.js#L193-L196
    - `currentTask` is `performConcurrentWorkOnRoot` from `react-reconciler`

- `performConcurrentWorkOnRoot`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L829
  - `renderRootSync`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L881-L883
  - `renderRootSync` def: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1663
  - `prepareFreshStack`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1688
    - Assigning `workInProgress` to: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1476-L1478
    - Assigning `workInProgress.alternate` to `current` (remember for later): https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiber.new.js#L275
  - `workLoopSync` usage: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1703
  - `workLoopSync` def: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1741-L1746

- Inside `workLoopSync`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1744
  - Take `.alternate` of `unitOfWork` (on first render, `FiberRoot`): https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1840
  - `beginWork`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1849
  - Depending on type of `unitOfWork`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L3780-L3952
    - `React.StrictMode` is `Mode`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L3856
    - DOM element is `HostComponent`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L3831
  - EG: `HostComponent` calls `updateHostComponent`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L1426
  - Bonus: **`markRef`** is how `ref` is assigned to a node: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L1456
  - `reconsileChildren`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L1457
  - `reconcileChildFibers`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberBeginWork.new.js#L312
  - Re-run `beginWork` on all children via: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactChildFiber.new.js#L1245-L1347
  - Once done, call `completeUnitOfWork`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1856

- `completeUnitOfWork`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1864
  - `completeWork`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1883
  - Depending on type of root, render: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L860
  - DOM element is `HostComponent`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L961
  - `createInstance`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L1010-L1016
    - `createElement`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-dom/src/client/ReactDOMHostConfig.js#L270-L275
  - `appendAllChildren`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L1018
    - `appendInitialChild`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberCompleteWork.new.js#L225
      - https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-dom/src/client/ReactDOMHostConfig.js#L285

- `finishConcurrentRender`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L954
  - Inside: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1024
  - `commitRoot`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1149-L1153
  - `commitRootImpl`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L1976-L1981
  - `commitMutationEffects`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L2163
- `commitMutationEffects`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L2036
  - `commitMutationEffectsOnFiber`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberCommitWork.new.js#LL2045
  - `HostRoot`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L2254
  - `commitReconcilationEffects`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L2256
  - `commitPlacement`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L2444
  - `insertOrAppendPlacementNode`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L1520
  - `insertBefore` or `appendChild`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberCommitWork.new.js#L1578-L1583
  - Inside `react-dom`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-dom/src/client/ReactDOMHostConfig.js#L513-L519
- Back to `commitRootImpl`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L2163
  - **Bonus:** `commitLayoutEffects`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L2189
  - `requestPaint`: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L2206
  - **Bonus: Run double effects on dev**: https://github.com/facebook/react/blob/9e3b772b8cabbd8cadc7522ebe3dde3279e79d9e/packages/react-reconciler/src/ReactFiberWorkLoop.new.js#L2261-L2265

