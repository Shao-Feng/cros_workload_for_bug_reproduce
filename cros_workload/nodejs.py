#!/usr/bin/env python3

import httplib2
import os
import subprocess
import time

from cros_workload import workload

class NodeJS(workload.Workload):
  def __init__(self, name, verify_contents_string, args):
    """
    Args:
      name: String with the workload name
      verify_contents_string: Unique string in the website contents
      args: List of Args
    """
    self._name = name
    self._verify_contents_string = verify_contents_string
    self._args = args

    self._workload_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                      '..', self._name)
    self._proc = ''

  def _construct_start_command(self):
    """ Build the Popen input """
    command = []
    command.extend(('nodejs', 'server.js'))
    for arg in self._args:
      command.extend((arg.flag, arg.value))
    return command

  def _verify_contents(self):
    """Verify that the workload contents are OK"""
    try:
      client = httplib2.Http()
      (resp_headers, content) = client.request('http://localhost:' + self.port(),
                                               'GET',
                                               headers={'cache-control':'no-cache'})
      str_content = content.decode('utf-8', 'replace')
    except IOError:
      return False

    # First check for HTTP 200 OK
    if resp_headers['status'] != '200':
      return False

    # Then verify that the unique string exists in the content
    if self._verify_contents_string not in str_content:
      return False

    return True

  def pre_start(self):
    return True

  def start(self):
    self._proc = subprocess.Popen(self._construct_start_command(),
                                  cwd=self._workload_dir)

    # Verify that the start was successful
    for x in range(5):
      time.sleep(1)
      if self.running():
        return True

    return False

  def stop(self):
    # First check that the process is still running
    if self._proc.poll() is None:
      self._proc.terminate()
    self._proc.wait()
    return True

  def post_stop(self):
    return True

  def running(self):
    # First check that the process is still running
    if self._proc.poll() is not None:
      return False

    if not self._verify_contents():
      return False

    return True

  def name(self):
    return self._name

  def port(self):
    for arg in self._args:
      if 'port' in arg.flag:
        return arg.value
