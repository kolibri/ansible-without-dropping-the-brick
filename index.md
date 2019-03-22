# One hour into ansible

---

# Who is this guy

Lukas Sadzik <lukas.sadzik@sensiolabs.de>
Software Developer & Trainer @ SensioLabsDE
Automation Fan

@ko_libri


# Question at first:
- Whi already used ansible
- Who has to manage windows/macOs machines? (Poor people)

---

# Houston, do you got a problem?

## (What is the problem this talk want to solve)

- We need more/less webservers/containers/ec2instances/etc, and we need it now! (scaling)
- We have to setup ssl/upgrade php/remove ssh access for the po/etc. on some of/all our servers (maintenance)
- We want to know, what is installed/configured on our machines (documentation)
- We want to approve every change the trainee makes on our machines (reviewability)
- We need to discuss the setup or our infrastructure (teamwork)
- We need development vm's for our developers (automation)

- We want to deploy ACE! (automatically, continously, easily) (Yeah, just the every developer wants)

(- I want to automate everything) (The personal goal)


---

# Oh, look, a solution

There are a lot of tools to solve these problems:

- Chef
- Puppet
- SaltStack
- Ansible (this is, what this talk is about)


# Lets have a quick look at ansible

- Open source (GPL) and available on github 
- Maintianed/owned by Redhat

- written in python
- configured with YAML files (99%, rest is INI ;))

---

# How to install ansible

- Via yor favourite/available package manager

`pacman -Syu/apt-get/brew/yum/pip install ansible`

## PITFALL: 
There are a lot of installation methods mentioned on the installation guide. Just take the most easiest for you.
Do not install ansible via GIT, unless you know, what you are doing

---

# How does ansible work / the usual setup

- One control machine
    - This is the only one, that has ansible installed!

- Some managed machines
    - Only dependency is python (2 or 3, it does not matter anymore)
    - Accessable by the control machine (via SSH or whatever other auth mechanism ansible supports ;))


# The control machine

The only machine we interact with directly is the control machine.
It has ansible installed and our self written scripts checked out.

# The managed machines

We do not log in onto this machines (in a perfect world, we would not have access to this machines)
The only need python (=> 2.7) or Python 3 (>= 3.5) installed
And, our control machine has to be able to ceonnect to the managed machines.

# How to start, our first setup

Lets asume, we already have our managed machine. It may be a vagrant box, a server in a serverfarm, our own pc, a new raspberry pi or whatever you want.

We know the hostname/IP address, have a SSH login with sudo permissions or direct root access.


# The (first) three core concepts of ansible


## The `inventory`


The inventory is a file (or a collection of files), where we define our target machines.
This could be VMs, desktop-pc's, EC2 instances, Docker containers and so on, as long it can be accessed by ansible (usually via SSH, but there are more options).
we can (and should) group our hosts (like "all database server", "all webservers", etc.)

Also part of the inventory (but NOT the inventory file) is the special configuration of each host or group. This is placed inside YAML filed inside the `host_vars`/`group_vars` directory.


## Tasks


A task is a single step during the provisioning. It can be theoretically anything, as long a module exists for the task.

Some examples (with the belonging module-name)
- Ensure that file XXY exists with this content (`template`, `copy`)
- Ensure service ABC is running (`service`)
- Ensure user FOOBAR exists and has no sudo privilege (`user`)
- Deploy APP to PROD (`deploy_helper`)
- Run script TAKE_WORLD_LEADERSHIP (`shell`, `command`)
- Ensure this git repo is checked out and at the current commit of that branch (`git`)

There are a lot built in modules to explore, that should satisfy 99% of the usual needs.

Tasks are written in "Playbooks" or "Roles". You can also execute tasks directly with the `ansible` command line tool (but this is rarely used and not recommended)



## Playbook

A playbook is that part, that is executed by the `ansible-playbook` command.

It defines, on which host which tasks/roles should be executed.


---

# Our first setup

## With vagrant

```ruby
# Vagrantfile
Vagrant.configure("2") do |config|
  config.vm.box = "debian/stretch64"
    config.vm.network "private_network", ip: "192.168.31.37"
end

```



```ini
# ./inventory
192.178.31.37 ansible_connection=ssh ansible_user=vagrant ansible_ssh_private_key_file=.vagrant/machines/default/virtualbox/private_key

```

```yaml
# site.yml
---
- hosts: all
  tasks:
    - name: Greet someone
      shell: echo 'Hello World'
```

```bash
# cli
$ ansible-playbook site.yml -i inventory

PLAY [all] *******************************************************************************************************
Friday 22 March 2019  12:11:03 +0100 (0:00:00.114)       0:00:00.114 **********

TASK [Gathering Facts] *******************************************************************************************
ok: [demo.foo]
Friday 22 March 2019  12:11:03 +0100 (0:00:00.675)       0:00:00.789 **********

TASK [Greet someone] *********************************************************************************************
changed: [demo.foo]

PLAY RECAP *******************************************************************************************************
demo.foo                   : ok=2    changed=1    unreachable=0    failed=0

Friday 22 March 2019  12:11:04 +0100 (0:00:00.353)       0:00:01.143 **********
===============================================================================
Gathering Facts ------------------------------------------------------------------------------------------- 0.68s
Greet someone --------------------------------------------------------------------------------------------- 0.35s
```


