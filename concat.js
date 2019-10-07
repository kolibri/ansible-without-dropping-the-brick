const concat = require('concatenate-files');
let glob = require('glob');

let ignore = [
'./deck/000001_27_09_2019.mdx',
//'./deck/010_intro/000000_title.mdx',
//'./deck/010_intro/000010_who_is_this.mdx',
//'./deck/010_intro/000020_the_problem.mdx',
//'./deck/010_intro/000030_tool_overview.mdx',
//'./deck/010_intro/000040_about_ansible.mdx',
//'./deck/010_intro/000050_install_ansible.mdx',
//'./deck/010_intro/000060_how_does_ansible_work_title.mdx',
//'./deck/010_intro/000080_control_system.mdx',
//'./deck/010_intro/000090_managed_systems.mdx',
//'./deck/020_quickstart/010000_quickstart_with_vagrant.mdx',
//'./deck/020_quickstart/010005_tip_use_vagrant_for_a_quick_playground.mdx',
//'./deck/020_quickstart/010010_hello_world.mdx',
//'./deck/020_quickstart/010020_box_handling.mdx',
//'./deck/020_quickstart/010030_pitfall_ansible_command.mdx',
//'./deck/020_quickstart/010040_main_command.mdx',
//'./deck/020_quickstart/010050_play_result.mdx',
//'./deck/020_quickstart/010060_first_concepts.mdx',
//'./deck/020_quickstart/010070_playbooks.mdx',
//'./deck/020_quickstart/010080_tasks.mdx',
//'./deck/020_quickstart/010090_task_examples.mdx',
//'./deck/020_quickstart/010100_tip_name_your_tasks.mdx',
//'./deck/030_first_playbook/020000_first_playbook.mdx',
//'./deck/030_first_playbook/020010_gitconfig_file.mdx',
//'./deck/030_first_playbook/020020_setup_git_playbook.mdx',
//'./deck/030_first_playbook/020030_become_title.mdx',
//'./deck/030_first_playbook/020040_what_is_become.mdx',
//'./deck/030_first_playbook/020050_become_defaults.mdx',
//'./deck/030_first_playbook/020060_pitfall_become_does_not_imply.mdx',
//'./deck/030_first_playbook/020080_tip_more_than_sudo.mdx',
//'./deck/030_first_playbook/020090_become_on_cli.mdx',
//'./deck/030_first_playbook/020100_facts_title.mdx',
//'./deck/030_first_playbook/020110_print_all_facts.mdx',
//'./deck/030_first_playbook/020120_print_facts_result.mdx',
//'./deck/030_first_playbook/020130_use_fact.mdx',
//'./deck/030_first_playbook/020140_pitfall_valid_yaml.mdx',
//'./deck/030_first_playbook/020150_templates_title.mdx',
//'./deck/030_first_playbook/020160_variables_inside_playbook.mdx',
//'./deck/030_first_playbook/020170_gitconfig_template.mdx',
//'./deck/030_first_playbook/020180_tip_j2_extension.mdx',
//'./deck/030_first_playbook/020190_facts_are_global.mdx',
//'./deck/030_first_playbook/020200_facts_from_cli.mdx',
//'./deck/030_first_playbook/020210_loops_title.mdx',
//'./deck/030_first_playbook/020220_adding_zsh_title.mdx',
//'./deck/030_first_playbook/020230_loops_example.mdx',
//'./deck/030_first_playbook/020240_lineinfile_zsh_result.mdx',
//'./deck/030_first_playbook/020250_there_is_a_module_for_that.mdx',
//'./deck/030_first_playbook/020260_ini_module.mdx',
//'./deck/030_first_playbook/020270_link_to_loops_doc.mdx',
//'./deck/030_first_playbook/020280_handlers_title.mdx',
//'./deck/030_first_playbook/020290_tip_use_verbose_mode.mdx',
//'./deck/030_first_playbook/020300_verbose_result.mdx',
//'./deck/030_first_playbook/020310_install_ssh_title.mdx',
//'./deck/030_first_playbook/020320_handlers_example.mdx',
//'./deck/030_first_playbook/020330_handlers_result.mdx',
//'./deck/030_first_playbook/020340_tip_handlers_are_tasks.mdx',
//'./deck/030_first_playbook/020350_pitfall_restarting_services.mdx',
//'./deck/040_roles/030000_roles_introduction.mdx',
//'./deck/040_roles/030010_ansible_galaxy_command.mdx',
//'./deck/040_roles/030020_minimal_role.mdx',
//'./deck/040_roles/030030_refactor_zsh.mdx',
//'./deck/040_roles/030040_refactor_ssh.mdx',
//'./deck/040_roles/030050_refactor_git.mdx',
//'./deck/040_roles/030060_defaults_vs_vars_title.mdx',
//'./deck/040_roles/030070_defaults.mdx',
//'./deck/040_roles/030080_vars.mdx',
//'./deck/040_roles/030080_vars_example.mdx',
//'./deck/040_roles/030090_syntax_check_and_check_and_diff.mdx',
//'./deck/050_inventory/0400000_inventory_title.mdx',
//'./deck/050_inventory/0400010_inventory_ini_example.mdx',
//'./deck/050_inventory/0400020_set_inventory_from_cli.mdx',
//'./deck/050_inventory/0400030_host_and_group_vars_files.mdx',
//'./deck/050_inventory/0400040_tip_connection_infos_to_inventory.mdx',
//'./deck/050_inventory/0400050_tip_use_group_avoid_host_vars.mdx',
//'./deck/050_inventory/0400060_inventory_scaling_title.mdx',
//'./deck/050_inventory/0400070_infrastructure_layers.mdx',
//'./deck/050_inventory/0400080_stage_and_service_example_title.mdx',
//'./deck/050_inventory/0400090_simple_dir_structure.mdx',
//'./deck/050_inventory/0400100_complex_dir_structure.mdx',
//'./deck/050_inventory/0400110_link_to_dynamic_inventoy.mdx',
//'./deck/060_roles_advanced/050000_roles_advanced_title.mdx',
//'./deck/060_roles_advanced/050010_organizing_roles_title.mdx',
//'./deck/060_roles_advanced/050020_grouped_roles_example.mdx',
//'./deck/060_roles_advanced/050030_role_meta.mdx',
//'./deck/060_roles_advanced/050040_role_meta_example.mdx',
//'./deck/060_roles_advanced/050050_include_role_module.mdx',
//'./deck/060_roles_advanced/050060_assert_module.mdx',
//'./deck/060_roles_advanced/050070_vhost_example.mdx',
//'./deck/060_roles_advanced/050090_include_role_vs_include_tasks.mdx',
//'./deck/060_roles_advanced/050100_error_handling.mdx',
//'./deck/070_playbooks/060000_more_on_playbooks_title.mdx',
//'./deck/070_playbooks/060010_multiple_playbooks_part_one.mdx',
//'./deck/070_playbooks/060020_multiple_playbooks_part_two.mdx',
//'./deck/070_playbooks/060040_adding_host_example.mdx',
//'./deck/070_playbooks/060050_cloud_servcies_list.mdx',
//'./deck/090_outro/090000_next_steps.mdx',
//'./deck/090_outro/090010_useful_tools.mdx',
//'./deck/090_outro/090020_provision_everything.mdx',
//'./deck/999_end.mdx',

];

glob('./deck/**/*.mdx', {'ignore': ignore}, function(er,files){
concat(files, 'deck.mdx', {'separator': "\n\n---\n\n"})
})
