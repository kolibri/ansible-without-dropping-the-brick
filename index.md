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
- We need to discuss the setup or our infrastructure (teamwork and knowledge sharing)
- We need development vm's for our developers (automation)

- We want to deploy ACE! (automatically, continously, easily) (Yeah, just the stuff every developer wants)

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
- Maintained/owned by Redhat

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

We do not log in onto this machines manualy (in a perfect world, we would not have access to this machines)
The only need python (=> 2.7) or Python 3 (>= 3.5) installed
And, our control machine has to be able to ceonnect to the managed machines.


---

# Assistested quickstart with Vagrant

The most easy way to try out ansible might be using vagrant with the `ansible_local` provisioner.

You got an already to use environment in a virtual machine you can play around with. You don't need to bother about installing ansible and creating an inventory.

So, our inital learning setup looks like this:

```ruby
# ./Vagrantfile
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
    config.vm.box = "debian/stretch64"
    config.vm.host_name = "ansible-quickstart.foo"
    # this is the important stuff:
    config.vm.provision "ansible_local" do |ansible|
        ansible.playbook = "site.yml"
        ansible.verbose = true # optional, but just add it ;)
    end
end
```

```yaml
# ./site.yml
---
- hosts: all
  tasks:
    - name: Greet someone
      shell: echo 'Hello World'
```

Commands:
```bash
$ vagrant up # to start the vm. Provisioning is only executed when the box is created
$ vagrant provision # run the provisioning manually
```


# Our first concepts of ansible


## Playbooks

A playbook is a YAML-file, that is executed by the `ansible-playbook` command.

It assigns tasks (and/or roles) to a hosts, where they should be applied.


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

Tasks are placed in "Playbooks" or "Roles". You can also execute tasks directly with the `ansible` command line tool (but this is rarely used and I do not recommend this)



---

# Tip:

Call ansible at least with the first verbosity level (`ansible-playbook -v`). This will show you details about the executed tasks, that may have useful informations.


---

# Writing our first tasks

Lets install git and place a config file for our user

```yaml
# ./site.yml
---
- hosts: all
  tasks:
    - name: ensure git is installed
      become: true
      package: 
        name: git
        state: present
    - name: ensure git configs
      copy:
        src: gitconfig.dist
        dest: /home/vagrant/.gitconfig
```

```ini
# ./gitconfig.dist
[user]
    email = lukas.sadzik@sensiolabs.de
    name = Lukas Sadzik
[core]
    excludesfile = /home/vagrant/.gitignore
    editor = nano

```

We see some new stuff here.

At first, have a look at the two tasks:
`package` can install packages without the need to specify the package manager for the system.
`copy` copies files from the control machine to the managed machine. (But it also can copy file from the managed machine to another place at the managed machine).


Start with the first one: 

```yaml
- name: ensure git is installed
  become: true
  package: 
    name: git
    state: present
```



The next new thing you might have noticed is the `become: true` directive at the `package` task.

# Understaing `become`

Most Operating systems have some kind of user and user previliges system. If you are familiar with Unix systems, you should already know about this from your daily work.

The ansible tasks are executed with the same previliges that the user, that startet the run, has.
So, if you want to perform a task that need root previliges (like installing a package), you have to tell ansible to get this previliges. Or, in other words, you have to tell ansible, that this tasks should be executed with another user.
This is, what the `become` does. It says: To perform this task, you should become another user!

But we don't see any config about WHICH user, and HOW.

The reason for this is the default configuration for become:

```yaml
# become default configuration
become: false # set to yes to activate privilege escalation.
become_user: root # set to user with desired privileges
become_method: sudo # set to sudo/su/pbrun/pfexec/doas/dzdo/ksu/runas/machinectl
become_flags: ~ # permit the use of specific flags for the tasks or role. 
```

# PITFALL:

Setting `become_user`, `become_method` or `become_flags` does NOT imply `become: true`.
You can configure them, but if you do not add the `become: true` they have no effekt!
The reason behind this: You can configure `become_user/method/flags` globally for all tasks and still enable become only for the needed tasks.

# PITFALL: 

Make sure the user you use for the connection is able to perform the `become`.
The connection itself to the managed machine does not change if you use become. Imagine, you ssh into the machine and then call a command with `sudo`. This is the same for ansible.
Ansible does NOT create a new connection to the managed machine!


Tip: `become` can not only be configured for tasks. It can also applied to roles, playbooks, includes, blocks and even the entire playbook run.


In the most cases, you don't need to set any of the `become_*` directives.
The scenarios I encountered, where I need the `become_*` directives are:
- If the system has `sudo` not installed. But to install it, you need root previliges. In this case, try `become_method: su`.
- You want to configure stuff for another user on the system than the connection user. Applies to a system with multiple users. In this case, define the `become_user: targetUsername`. 


---



Now, lets look at the `copy` task

```yaml
- name: ensure git configs
  copy:
    src: gitconfig.dist
    dest: /home/vagrant/.gitconfig
```

# TIP: 

If you have to provision dotfiles, name the source files without the dot. This makes them more present and every tool can view them without any configuration.


You might noticed some drawbacks with the config file:

- The gitconfig file is static. We cannot use it for another user
- The path for the gitconfig file is also static

We want to solve this right now. Bit first we need the next concept of ansible: facts

# Introduction into facts

Facts are information about your system provided by ansible. 
You can get a list of all known facts with the `debug` task:

```
# ./site.yml
---
- hosts: all
  tasks:
    - debug: var=hostvars
```

On the next run, you will get a JSON document printed out containing all known facts:
This may be a huge list, and you should invest some time to get familiar with it. 
You should not know every fact it contains, but you should get a feeling, which information ansible provides you.

We will notice some facts related to the user, that executed ansible:



```
TASK [debug] *******************************************************************
ok: [default] => {
    "hostvars": {
        "default": {
            // [...],
            "ansible_user_dir": "/home/vagrant",
            "ansible_user_gecos": "Vagrant Default User,,,",
            "ansible_user_gid": 1000,
            "ansible_user_id": "vagrant",
            "ansible_user_shell": "/bin/bash",
            "ansible_user_uid": 1000,
            "ansible_userspace_architecture": "x86_64",
            "ansible_userspace_bits": "64",
            // [...],
        }
    }
}
```

We are interested in the `ansible_user_dir` fact, that gives us the home directory.

With this, we can modify our gitconfig task:

```yaml
- name: ensure git configs
  copy:
    src: gitconfig.dist
    dest: "{{ ansible_user_dir }}/.gitconfig"
```

What happended:

We added the `ansible_user_dir` fact to your task to create the path to the config file.
Inside every ansible YMAL file, we can use Jinja2 to address facts, filters, functions etc.

# PITFALL:

You have to write valid YAML files.
But, the Jinja notation for stuff to be echoed `{{ foo }}` conflicts with the YAML syntax for objects: `{ key: val }`.
This is the reason, why we have to put quotation marks around our value, if we use Jinja2 statements.

---

So, the place to the file is dynamic, but the content still static. To solve this, we need another module: `template`



```yaml
# site.yml
---
- hosts: all
  vars:
    git_user_email: torben@tester.de
    git_user_name: Lukas Sadzik
  tasks:
    - debug: var=hostvars
    # ... other tasks
    - name: ensure git configs
      template:
        src: gitconfig.j2
        dest: "{{ ansible_user_dir }}/.gitconfig"

```

```jinja2
# gitconfig.j2
[user]
    email = {{ git_user_email }}
    name = {{ git_user_name }}
[core]
    excludesfile = {{ ansible_user_dir }}/home/vagrant/.gitignore
    editor = nano
```


Lets first talk about the template. As it is not a YAML file, we don't need to encapsule the double braces between quotation marks.
(If you know Twig, the PHP Template engine, you alread know the most of Jinja2, as Twig is a clone of it).

# Tip:
Always add the `.j2` file extension to your templates. I allso suggest to add the ending fo the target file. Example: `vhost.conf.j2`. With this, you can easily spot, that this file is a template and the rendered result will be a `*.conf` file.

Then, we have to look at the playbook and see, that we define two "Variables" here: `git_user_email` and `git_user_name`. They are available for all tasks and templates inside this play. so we can use them in our template.

# Pitfall:

Vars defined this style only available for this section.

Example:

```yaml
---
- hosts: all
  vars:
    my_var: foobar
  tasks:
    - debug: var=my_var # will work

- hosts: all
  tasks:
    - debug: var=my_var # will NOT work, as var is not defined here
```


So, now we have a fully configurable setup of a playbook, that ensures git and a gitconfig for the current user. But it is not optimized.
If we want to add some configurations, we need to touch two files, the template to add the config we want and the playbook to adjust the vars (if the config value should come from a variable)

But, before we take care of this, lets add another package, `zsh` to play around with:

```
# site.yml
---
- hosts: all
  # [...]
  tasks:
    - name: ensure git is installed
      become: true
      package: 
        name: 
          - git
          - zsh
        state: present
```

You see, instead of providing one value to the `name` attribute, we now pass a list of values.
This style also applies to all other package managing modules.

Lets add some config for `zsh`. For example two aliases:

```yaml
---
- hosts: all
  # [...]
  tasks:
    # [...]
    - name: ensure aliases for zsh
      lineinfile:
        dest: "{{ ansible_user_dir }}/.zshrc"
        line: "{{ item }}"
      loop:
        - 'ALIAS dog=cat'
        - 'ALIAS yolo=sudo'
```

At first, what does the `lineinfile` module do: It ensures lines in a file. You cann add a regular expression, that must match to a line in case you want to replace an existing line.

You see the `loop` directive. It tells ansible, to execute this tasks with each item of the `loop` array. The content of the line will be available as `item` inside the task.



    - name: ensure git config
      ini_file:
        dest:    "{{ ko_user_home }}/.gitconfig"
        section: "{{ item.ns }}"
        option:  "{{ item.name }}"
        value:   "{{ item.value }}"
      loop:
        - { ns: user, name: email,        value: "{{ git_user_mail }}" }
        - { ns: user, name: name,         value: "{{ git_user_name }}" }
        - { ns: push, name: default,      value: simple }
        - { ns: core, name: excludesfile, value: "{{ ansible_user_dir }}/.gitignore" }
```




So, again, lets change the module. Instead of `template`, we use `ini_file`

```yaml
- name: ensure git config
  ini_file:
    dest:    "{{ ko_user_home }}/.gitconfig"
    section: "{{ item.ns }}"
    option:  "{{ item.name }}"
    value:   "{{ item.value }}"
  loop:
    - { ns: user, name: email,        value: "{{ ko_git_mail }}" }
    - { ns: user, name: name,         value: "{{ ko_git_user }}" }
    - { ns: push, name: default,      value: simple }
    - { ns: core, name: excludesfile, value: "{{ ko_user_home }}/.gitignore" }
```










































# Tip:

Always name your tasks! Find unique and meaningfull short descriptions for the task.
This will not only add a inline documentation but also gives you the option to use the `--start-at-task` option while executing playbooks.
Also it will make the output more nicer ;)








# The (first) three core concepts of ansible


## The `inventory`


The inventory is a file (or a collection of files), where we define our target machines.
This could be VMs, desktop-pc's, EC2 instances, Docker containers and so on, as long it can be accessed by ansible (usually via SSH, but there are more options).
we can (and should) group our hosts (like "all database server", "all webservers", etc.)

Also part of the inventory (but NOT the inventory file) is the special configuration of each host or group. This is placed inside YAML filed inside the `host_vars`/`group_vars` directory.








---

## PITFALL:

### Use YAML style tasks, not inline style

```yaml
- name: Do not use this style
  template: src=my_template.conf.j2 dest=/path/to/target/file.conf

- name: This is better to read, use this
  template:
    src: my_template.conf.j2
    dest: /path/to/target/file.conf
```

### Name your tasks

And make shure every task has a unique name.
This will allow you to use the `--start-at-task` flag of the `ansible-playbook` command.



# Some first tasks

## `package` ensures packages are installed

```yaml
- name: Ensure some packages
  package:
    name:
      - nginx
      - mysql
      - php
```

`package` selects the default package manager on the operating system
There are modules for the most used package managers available (like `apt`, `pacman`, `yum`, `homebrew` and even language specific managers like `bower`, `composer`, `gem`, `npm`, `pip`, `yarn`)


## `template` renders templates to files

```yaml
- name: Ensure a template
  template:
    src: my_template.conf.j2
    dest: /path/to/target/file.conf
```

Templates are written in Jinja2 (if you know Twig, it's almost the same)
Every variable known to ansible is accessible inside templates

---

## `copy` copies files

```yaml
- name: Copy a file from control machine to remote machine
  copy:
    src: file_to_copy.conf
    dest: /path/to/target/path.conf
```

## `file` set attributes of files, create directories, symlinks etc

```yaml
- name: ensure a file exists via touch
  file:
    path: /path/to/symlink
    state: touch

- name: ensure a directory exists
  file:
    path: /path/to/directory
    state: directory

- name: ensure a file/directory does not exists
  file:
    path: /should/not/be/here
    state: absent
```

## `lineinfile` ensures a file contains specific lines

```yaml
- name: ensure root login is disabled
  lineinfile:
    dest: /etc/ssh/sshd_config
    line: PermitRootLogin no
    regexp: "^PermitRootLogin.*$"
```

## `get_url` downloads files via HTTP/s or FTP 

```yaml
- name: Download file with checksum url (sha256)
  get_url:
    url: http://example.com/path/to/file.conf
    dest: /etc/foo.conf
    checksum: 'sha256:http://example.com/path/to/checksum'
```


---

# Short recap

- Inventory: Collection of our hosts
- Task: Things to do
- Playbook: Assigns Tasks to hosts


---

# Roles

Roles are the concept for resusability in ansible.
They are a collection of tasks, handlers (explained later), can bring their own configuration, can depend on other roles and some more stuff.

In our setup, roles appear as directories with a defined list of subdirectories and files:

## TIP:

Create your roles with the `ansible-galaxy` command. It is faster and less error-prone than creating them manually

```
$ ansible-galaxy init greet --init-path=roles
$ tree roles
roles
└── greet
    ├── README.md
    ├── defaults
    │   └── main.yml
    ├── files
    ├── handlers
    │   └── main.yml
    ├── meta
    │   └── main.yml
    ├── tasks
    │   └── main.yml
    ├── templates
    ├── tests
    │   ├── inventory
    │   └── test.yml
    └── vars
        └── main.yml
```


## Most common directories and files in a role:

- `tasks/main.yml`: The default tasks file of the role. Tasks in this file will be executed, when you apply the role in your playbook.
- `defaults/main.yml`: The configuration file for the role. 
- `handlers/main.yml`: Place handlers (explained later) here and you automaticaly can reference them in your tasks
- `templates/` & `files/`: Place files and templates here for easy access inside of your role.
- `meta/main.yml`: Used for definind dependencies to other roles and also for general information (like the maintainer of the role and so on)

## Lets move the greeting into a role

```yaml
# roles/greet/tasks/main.yml

---
- name: Greet someone
  shell: "echo 'Hello {{ greet_target }}'"
```

```yaml
# roles/greet/defaults/main.yml

---
greet_target: Ansible Users
```

```yaml
# site.yml

---
- hosts: all
  roles:
    - greet
```

```bash
$ ansible-playbook -i inventory site.yml -v
[...]
PLAY [all] *******************************************************************************************************************************************
Friday 05 April 2019  13:33:05 +0200 (0:00:00.106)       0:00:00.106 **********

TASK [Gathering Facts] *******************************************************************************************************************************
ok: [demo.foo]
Friday 05 April 2019  13:33:06 +0200 (0:00:00.747)       0:00:00.854 **********

TASK [greet : Greet someone] *************************************************************************************************************************
changed: [demo.foo] => {
    "changed": true,
    "cmd": "echo 'Hello Ansible Users'",
    "delta": "0:00:00.002443",
    "end": "2019-04-05 11:24:52.458708",
    "rc": 0,
    "start": "2019-04-05 11:24:52.456265"
}

STDOUT:

Hello Ansible Users


PLAY RECAP *******************************************************************************************************************************************
demo.foo                   : ok=2    changed=1    unreachable=0    failed=0

Friday 05 April 2019  13:33:06 +0200 (0:00:00.324)       0:00:01.178 **********
===============================================================================
Gathering Facts ------------------------------------------------------------------------------------------------------------------------------- 0.75s
greet : Greet someone -----
```

## Variables and Facts

## Print out all known facts for a host:

```yaml
# site.yml
---
- hosts: all
  tasks:
    - debug: var=hostvars
```

## Usage of facts & variables

```
# site.yml
---
- hosts: all
  tasks:
    - name: Say hello
      shell: "echo '{{ ansible_hostname }}'"
```

All YAML files are parsed as Jinja2 Templates. So, you can 
