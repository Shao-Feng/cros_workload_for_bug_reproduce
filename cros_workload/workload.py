#!/usr/bin/env python3

import abc

class Workload(object):
  __metaclass__ = abc.ABCMeta

  @abc.abstractmethod
  def pre_start(self):
    """Workload specific steps before actually starting"""
    return

  @abc.abstractmethod
  def start(self):
    """Workload specific steps to start"""
    return

  @abc.abstractmethod
  def stop(self):
    """Workload specifics steps to stop"""
    return

  @abc.abstractmethod
  def post_stop(self):
    """Workload specifics steps after stopping"""
    return

  @abc.abstractmethod
  def running(self):
    """Workload specific checks for known good running state

    Returns:
      bool: True if running OK. False otherwise.
    """
    return

  @abc.abstractproperty
  def name(self):
    """Getter for the workload name"""
    return

  @abc.abstractproperty
  def port(self):
    """Getter for the workload port"""
    return
