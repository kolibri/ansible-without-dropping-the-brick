# Thins I want to say

- Where to put variables?
    - Find good defaults and place them in the roles `defailts/main.yml`

Split between configuration:

WHAT should be provisioned? (Roles, packages, etc)
    -> Host/Group-specific Playbook

HOW should it be provisioned (Configuration)
    -> Could be 



```yaml
# site.yml
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

----
2 > Note about this
4, 9 
4[5:36], 9[5:31] 
```
