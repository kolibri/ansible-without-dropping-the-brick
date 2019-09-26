# usage: make STEP=01
step:
	vagrant ssh -c"cd /vagrant/steps/$(STEP) && ansible-playbook site.yml -c local -i localhost, -v"
