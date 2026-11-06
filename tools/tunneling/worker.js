/* Web Worker: runs the heavy tasks off the UI thread */
importScripts('core.js', 'semiclassical.js', 'tasks.js');
self.onmessage = (ev) => {
  const { id, task, args } = ev.data;
  try {
    const progress = (f, msg) => self.postMessage({ id, progress: f, msg });
    const res = task === 'profiles' ? TunnelingTasks.runProfiles(args, progress) : TunnelingTasks.runPath(args, progress);
    self.postMessage({ id, result: res });
  } catch (e) { self.postMessage({ id, error: e.message }); }
};
