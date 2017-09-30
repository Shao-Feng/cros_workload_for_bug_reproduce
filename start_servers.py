#!/usr/bin/env python3

import logging
import os
import signal
import time
from collections import namedtuple

from cros_workload import nodejs

Arg = namedtuple('Arg', ['flag', 'value'])

class CrosWorkloads():
  """Main class to start and monitor the various workloads."""
  def __init__(self):
    #self._workloads_dir = os.path.join(os.getcwd(), 'third_party')
    self._workloads_dir = os.getcwd()
    self._workloads = self._init_workloads()
    self._monitor_delay = 30
    self._signal_recieved = ''

    self.log = ''
    self.formatter = ''
    self._init_logging()

  def _init_workloads(self):
    """Returns a list of Workloads"""
    php_cgi = '/usr/bin/php-cgi'
    workloads = []

    # Workloads served with node.js
    workloads.append(nodejs.NodeJS('yahvp', 'Yet Another HTML5 Video Player',
                                   [Arg('--port', '7000')]))

    return workloads

  def _init_logging(self):
    """Setup python logging and formatting"""
    # Setup logging variable
    self.log = logging.getLogger("collection-log")
    self.log.setLevel(logging.INFO)
    self.formatter = logging.Formatter("%(asctime)s %(message)s", "%Y-%m-%d %H:%M:%S")

    # Log to stdout
    streamhandler = logging.StreamHandler()
    streamhandler.setLevel(logging.INFO)
    streamhandler.setFormatter(self.formatter)
    self.log.addHandler(streamhandler)

  def _cleanup(self):
    """Shutdown any workloads"""
    for workload in self._workloads:
      self.log.info("%-20s KILLING", workload.name())
      workload.stop()
      workload.post_stop()

  def _restart_workload(self, workload):
    """Shutdown the workload and restart"""
    self.log.info('%-20s RESTARTING', workload.name())
    workload.stop()
    workload.post_stop()
    workload.pre_start()
    workload.start()

  def _monitor_loop(self):
    """Check the workload status and restart as necessary"""
    while self._continue_running():
      for wl in self._workloads:
        if not wl.running():
          self.log.info('%-20s FAILED', wl.name())
          self._restart_workload(wl)
        else:
          self.log.info('%-20s OK', wl.name())

      time.sleep(self._monitor_delay)

  def _continue_running(self):
    """ Should the script keep running? Returns True/False """
    if self._signal_recieved == signal.SIGINT:
      return False

    return True

  def signal_handler(self, signal, frame):
    self._signal_recieved = signal

  def start(self):
    """Start all of the workloads"""
    for workload in self._workloads:
      self.log.info("%-20s STARTING port=%s" % (workload.name(), workload.port()))
      workload.pre_start()
      workload.start()
    self._monitor_loop()
    self._cleanup()


if __name__ == '__main__':
  cros_workloads = CrosWorkloads()
  signal.signal(signal.SIGINT, cros_workloads.signal_handler)
  cros_workloads.start()
