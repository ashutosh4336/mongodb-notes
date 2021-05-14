const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
  MessageChannel,
} = require('worker_threads');
const numOfCPUs = require('os').cpus().length;

// const { port1: mainPort, port2: workerPort } = new MessageChannel();

if (isMainThread) {
  const workers = [];
  const startTime = Date.now();
  const numOfElements = 1_00_00_00_000;

  //   const numOfElements = 100;
  const sharedBuffer = new SharedArrayBuffer(
    Int32Array.BYTES_PER_ELEMENT * numOfElements
  );
  const arr = new Int32Array(sharedBuffer);

  const numElementsPerThread = numOfElements / 4;

  while (workers.length < 4) {
    const start = workers.length * numElementsPerThread;
    const end = start + numElementsPerThread;

    const worker = new Worker(__filename, {
      workerData: {
        index: workers.length,
        arr,
        start,
        end,
      },
    });

    worker.on('message', (message) => {
      console.log('From Master', message);
    });
    workers.push(worker);
  }
  const endTime = Date.now();
  console.log((endTime - startTime) / 1000, 'Seconds');
} else {
  //   console.log(
  //     Date.now(),
  //     'With Index',
  //     workerData.index,
  //     'started at',
  //     workerData.start,
  //     'and Ended at ',
  //     workerData.end
  //   );
  for (let i = workerData.start; i < workerData.end; i++) {
    workerData.arr[i] = i + 2;
  }
  const message = `${workerData.index} Done...`;

  parentPort.postMessage({ message });
}

/**
 * # Threads

Node.js uses two kinds of threads: a main thread handled by event loop and several auxiliary threads in the worker pool.

Worker pool is implemented in libuv
 */
