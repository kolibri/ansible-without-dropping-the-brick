# Ansible without dropping a brick

---

# Who is this guy

Lukas Sadzik <lukas.sadzik@sensiolabs.de>
Software Developer & Trainer @ SensioLabsDE
Automation Fan

@ko_libri

# Question at first:

- who uses vagrant
- Who already used ansible
- who has to handle more than two/ten/twenty/hundret machines?

# This I have to say first:

- Code examples are for demonstration. You might see things that can and should solved different in a real environment. Als always with learning, the order is think first, then question everything, rethink and then try out.

---

# Houston, do you got a problem?

## (What is the problem this talk want to solve)

- We need more/less webservers/containers/ec2instances/etc, (scaling)
- We have to setup ssl/upgrade php/remove ssh access for the po/etc. on some of/all our servers (maintenance)
- We want to know, what is installed/configured on our machines (documentation)
- We want to approve every change the trainee makes on our machines (reviewability)
- We need to discuss the setup or our infrastructure (teamwork and knowledge sharing)
- We need development vm's for our developers (singe point of truth)
- And we want it, when we need it (automation)

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
- configured with YAML files (sorry Marco)

---

# How to install ansible

- Via yor favourite/available package manager

`(pacman -Syu)/(apt-get/brew/yum/pip install) ansible`

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
And, our control machine has to be able to connect to the managed machines.

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

# Rule:

Always name your tasks! Find unique and meaningfull short descriptions for the task.
This will not only add a inline documentation but also gives you the option to use the `--start-at-task` option while executing playbooks.
Also it will make the output more nicer ;)

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

# Understanding `become`

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
        - "ALIAS dog=cat"
        - "ALIAS yolo=sudo"
```

At first, what does the `lineinfile` module do: It ensures lines in a file. You cann add a regular expression, that must match to a line in case you want to replace an existing line.

You see the `loop` directive. It tells ansible, to execute this tasks with each item of the `loop` array. The content of the line will be available as `item` inside the task.

As this is a very simple example of the usage of loops, lets get back to the `.gitconfig` file and replace the `template` with a `ini_file` module (Which ensures settings in a ini style format):

```yaml
- name: ensure git config
  ini_file:
    dest: "{{ ko_user_home }}/.gitconfig"
    section: "{{ item.ns }}"
    option: "{{ item.name }}"
    value: "{{ item.value }}"
  loop:
    - { ns: user, name: email, value: "{{ git_user_mail }}" }
    - { ns: user, name: name, value: "{{ git_user_name }}" }
    - { ns: push, name: default, value: simple }
    - {
        ns: core,
        name: excludesfile,
        value: "{{ ansible_user_dir }}/.gitignore",
      }
```

Have a look at the usages of `{{ item.* }}` and see the keys defined at the `loop` rows.

---

# Handlers

Lets take care of ssh. We want to ensure that you cannot connect as root user and that the service is running.

```yaml
# site.yml
---
- hosts: all
  [...]
   tasks:
    [...]
    - name: ensure root login is disabled
      become: yes
      lineinfile:
        dest: /etc/ssh/sshd_config
        line: PermitRootLogin no
        regexp: "^PermitRootLogin.*$"
      notify:
        - restart ssh

    - name: ensure ssh service is enabled
      service:
        name: sshd
        enabled: yes
      notify:
        - restart ssh

  handlers:
    - name: restart ssh
      become: yes
      service:
        name: sshd
        state: restarted
```

We see some new stuff here.
The `lineinfile` module again, but with a `notify` attached, the `service` task module, also with the `notify` and an entire new section in the playbook: `handlers`.

Let's start with the `service` task module. With this, we can control the enabled and running state of our services. In most cases we are talking about `systemd` services, but it also could be a service BSD init, OpenRC, SysV, Solaris SMF, or upstart.

In our case we just say, that the service named `ssh` should be enabled at startup. We do NOT restart the service at task level. Why not? As our setup gets bigger, it might happen, that another, later task also modifies files, that causes us to restart our service.
Yes, we just could add another restarting task right behind that, but this would result in our services restarting multiple times, probably with unfinished configurations. Also, it's doublicated code.

We want to restart our services after all other tasks are executed.
The tool for this are handlers.

For restarting the service, we use a so called `handler`.
Handlers are tasks, that are executed after all regular tasks are finished. And they are only executed, if a task told them so. This is, where the `notify` comes in play. You probably noticed, that the string `restart ssh` appears at the `notify`'s and also is the name of the `service` task at `handlers:` level. And you are right, this is the connection.

I think, I have to say, that there are no special type of tasks, that you use as handlers. They are just regular tasks. You can also say, at the end of every run, if the task for changing the user password has changed, write the new password to a file on the control machine. But in the most cases, you will just add `service` modules and this is just fine. You also can notify multiple handlers

###### TRY THIS OUT BEFORE!!! (and even notify handlers from other handlers)

# Roles

Our placebook now ensures binaries and configuration for three packages: `git`, `zsh` and `ssh`.
You could say, this is a violation of the single responsibility principle, and even if we are not programming OOP code, this is true. Also, the values we want to use are hardcoded, which is not that nice.
So, we need segregation and reusability. In ansible the concept for that are "roles".

## What is a role

Roles appear as a predefined directory structure to place tasks, variables, handlers and other stuff in organized files.
To create a new role, use the `ansible-galaxy init` command. It will create the complete directory structure along with example files.

```bash
$ ansible-galaxy init --init-path=roles  git
- git was created successfully
$ tree
.
├── roles
│   └── zsh
│       ├── defaults
│       │   └── main.yml
│       ├── files
│       ├── handlers
│       │   └── main.yml
│       ├── meta
│       │   └── main.yml
│       ├── README.md
│       ├── tasks
│       │   └── main.yml
│       ├── templates
│       ├── tests
│       │   ├── inventory
│       │   └── test.yml
│       └── vars
│           └── main.yml
└── site.yml
```

Yes, this are some directories names that hint to stuff we don't have covered yet.
But we ignore them and strip this down to all we need for our zsh role:

```bash
.
├── roles
│   └── zsh
│       └── tasks
│           └── main.yml
└── site.yml
```

Yeah, thats it. Just redefine our definition of a role: A role is a file named `main.yml` inside a `tasks` directory, that is inside a directory named after the roles name.

Inside this file we now move all tasks from the playbook that are related to zsh:

```
# roles/zsh/tasks/main.yml
- name: ensure zsh is installed
  become: true
  package:
    name: zsh
    state: present

- name: ensure aliases for zsh
  lineinfile:
    dest: "{{ ansible_user_dir }}/.zshrc"
    line: "ALIAS {{ item }}"
    create: yes
  loop:
    - dog=cat
    - yolo=sudo
```

And add a `roles` section with our newly created role in the playbook. We have to dublicate the `package` task for that, but that is fine:

```yaml
# site.yml
- hosts: all
  roles:
    - zsh

```

Thats it. This was the first refactoring of our playbook.

Lets continue with `ssh`. The tasks go into `roles/zsh/tasks/main.yml`, the handlers into `roles/zsh/handlers/main.yml`.

```
# roles/ssh/tasks/main.yml
- name: ensure ssh server is installed
  become: true
  package:
    name:  openssh-server
    state: present

- name: ensure root login is disabled
  become: yes
  lineinfile:
    dest: /etc/ssh/sshd_config
    line: PermitRootLogin no
    regexp: "^PermitRootLogin.*$"
  notify:
    - restart ssh

- name: ensure ssh service is enabled
  service:
    name: sshd
    enabled: yes
  notify:
    - restart ssh
```

```
# roles/ssh/handlers/main.yml
- name: restart ssh
  become: yes
  service:
    name: sshd
    state: restarted
```

```
# site.yml
```

The last role we create is the one for `git`. But pay attention, there is a tiny pitfall in the playbook, we assigned our variables to `vars`. And you might think, that we should put our variables inside the `vars` dir of the role. And it would work. But there is a better place.

# defaults vs vars

Roles provide two directories to store variables inside: `defaults` and `vars`. They can be intepreted as some kind of visibility for the defined variables. `defaults` provide the public interface for the role. Everything here can be overwritten, so we should only provide good defaults, where we can an where we can't ensure these are filles propperly.
The `vars` should be seen as private configuration. It should not be overwritten from outside. But it is also kinda special. The most common use case for `vars` is to provide valus depending on facts, for example the distribution. Think about our ssh service. The package and service name might be different on other distributions:

| dist   | package        | service |
| ------ | -------------- | ------- |
| debian | openssh-server | sshd    |
| ubuntu | openssh-server | ssh     |
| arch   | ssh            | sshd    |

The idea is, to create a configuration file named after each distribution, and place the target configuration inside. At the tasks, you use the `include_vars` module to load the file based on the distribution name fact.
Another usecase could be to assign memory to certain applications based on the memory fact, apply certain configs for different ip ranges, etc.

# Back to our git role

So, we move the variables in our playbook to `roles/git/defaults/main.yml` and the tasks to `roles/git/tasks/main.yml`

```
roles/git/defaults/main.yml
```

```
roles/git/tasks/main.yml
```

# Role Meta

This is the place to mention, that almost everything in ansible is global. You can notify handlers from other roles, use there defaults and vars and so on.
Saying this, it can and will happen, that roles depend on each other.

```

```

The Inventory:

Currently, we only have one machine, that is managed. (And because, we are using the ansible_local provisioner from vagrant, it also manages itself.)

But the usual infrastructure setup contains more than one host. It also may contain different types of hosts.
Lets pick an example:

For our production setup, we want two hosts for our frontend application, one for our backend and one for the database.

We also want a stage and test environment. And it would be great, if we use the same playbooks for our development setup.

To add more layers we also could say we add different regions, but lets stick with the first two: The host type and stage environment.

When stage is the same as production, test can work with only one frontend instance and the development handles everything on the same vm, we can group it like this:

|       | frontend                          | backend         | database         |
| ----- | --------------------------------- | --------------- | ---------------- |
| prod  | frontend01.prod frontend02.prod   | backend01.prod  | database01.prod  |
| stage | frontend01.stage frontend02.stage | backend01.stage | database01.stage |
| test  | frontend01.prod                   | backend01.stage | database01.test  |
| dev   | local.dev                         | local.dev       | local.dev        |

And we got a table of hostnames.

For each stage environment we create now a file and place the hosts inside:

```ini
# inventory/prod
[frontend]
frontend01.prod
frontend02.prod
[backend]
backend01.prod
[database]
database01.prod
```

```ini
# inventory/test
[frontend]
frontend01.prod
[backend]
backend01.prod
[database]
database01.prod
```

```ini
# inventory/dev
[frontend]
local.dev
[backend]
local.dev
[database]
local.dev
```

We also introduced the directory `inventory` in which these files are living.
From now on, we have to specify the inventory we want to use:

```bash
$ ansible-playbook --inventory=inventory/prod site.yaml
```

And not to forget: seperating by stage environment makes it a bit harder to execute plays on the different environment ;)

Lets take care of the other layer of configuration we got. Thy types of hosts. We will call them "groups" for now!

We need to new directories for them. But we will try to use only one.

`group_vars` is the one we want. Inside it, we create yaml files for each group we have and place the configs inside.

`host_vars` can contain files named after a host with host specific configuration. Our intention is, to grow fast, so we will need to handle a lot of machines, that are assigned to less groups. No hard decision, where we want to place our stuff, is it?

```
.
└── inventory
    ├── group_vars
    │   ├── backend.yml
    │   ├── database.yml
    │   └── frontend.yml
    ├── host_vars/
    ├── dev
    ├── prod
    ├── stage
    └── test
```

### But, there is something missing

Yes, by calling only the 'type of host'-layer `groups`, we forgot about configurations specific for stage environments. Like database passwords, certificates and so on. Yeah, stage environments are also groups. And we add for each of them a file inside `group_vars`.

```
.
└── inventory
    └── group_vars
        ├── backend.yml
        ├── database.yml
        ├── dev.yml
        ├── frontend.yml
        ├── prod.yml
        ├── stage.yml
        └── test.yml
```

Yes, it looks horrible. Lets add prefxies for each layer of configuration:

```
.
└── inventory
    └── group_vars
        ├── group_backend.yml
        ├── group_database.yml
        ├── group_frontend.yml
        ├── stage_dev.yml
        ├── stage_prod.yml
        ├── stage_stage.yml
        └── stage_test.yml
```

Do not forget to adjust the inventory files ;)

# a word about environments (only if time)

...

# A step back

Lets recap.

We now have playbooks, that assign roles and tasks to hosts.
We have roles, which handle one component of our setup.
And we got our variables from the inventory.

All are represented by files in directories. Time for some organization:

```
.
├── inventory
│   ├── group_vars
│   │   ├── all.yml
│   │   ├── group_backend.yml
│   │   ├── group_database.yml
│   │   ├── group_frontend.yml
│   │   ├── stage_dev.yml
│   │   ├── stage_prod.yml
│   │   ├── stage_staging.yml
│   │   └── stage_test.yml
│   ├── host_vars/
│   ├── dev
│   ├── prod
│   ├── stage
│   └── test
├── roles
│   ├── git/
│   ├── ssh/
│   └── zsh/
├── playbooks/
│   ├── backend.yml
│   ├── database.yml
│   ├── frontend.yml
│   └── dev.yml
└── site.yml
    Makefile
    Vagrantfile

```

This already looks fine. We maybe dont have the host_var file for `frontend02.prod`, which is even nicer.
I added the playbooks directory with playbooks for the groups.
The `site.yml` still exists. It just imports the other playbooks. (In a growing setup, this could be a place to perform global tasks for ANY host, but als alway with global, think and rethink twice before you do.)

```
# site.yml
```

# host pattern for playbooks

(More than one host in a playbook)

---

# A new way to look at roles

## Roles as module

## Understanding dependencies

# Addition to variables

## Where are variables loaded from

## Naming conventions

# The Package state problem

# Dynamic inventory

## ## Self written example??

## AWS example

### (If time) Fact caching

### Module showcase candidates:

get_url
deploy_helper
shell && command
user (data fetching)
complex lineinfile
unarchive
find
stat
set_fact
assert
fail
wait_for
filesystem
make
add_host
group_by:

template tricks

just this list:
bower – Manage bower packages with bower
bundler – Manage Ruby Gem dependencies with Bundler
composer – Dependency Manager for PHP
cpanm – Manages Perl library dependencies.
easy_install – Installs Python libraries
gem – Manage Ruby gems
maven_artifact – Downloads an Artifact from a Maven Repository
npm – Manage node.js packages with npm
pear – Manage pear/pecl packages
pip – Manages Python library dependencies
yarn – Manage node.js packages with Yarn

---

git – Deploy software (or files) from git checkouts
git_config – Read and write git configuration
github_deploy_key – Manages deploy keys for GitHub repositories.
github_hooks – Manages GitHub service hooks.
github_issue – View GitHub issue.
github_key – Manage GitHub access keys.
github_release – Interact with GitHub Releases
gitlab_deploy_key – Manages GitLab project deploy keys.
gitlab_group – Creates/updates/deletes Gitlab Groups
gitlab_hooks – Manages GitLab project hooks.
gitlab_project – Creates/updates/deletes Gitlab Projects
gitlab_user – Creates/updates/deletes Gitlab Users

---

jenkins_job – Manage jenkins jobs
jenkins_job_facts – Get facts about Jenkins jobs
jenkins_plugin – Add or remove Jenkins plugin
jenkins_script – Executes a groovy script in the jenkins instance

---

# (Maybe, not sure)

### Inventory layouts from best practices

### Things to play around with

- different os
- different use case (like desktop, mediaserver, nas, etc.)

##

We also want to take a look at the `roles/` directory. For now it only contains three roles. They are simmilar, because each of them handles a package.

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

---

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
    checksum: "sha256:http://example.com/path/to/checksum"
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
