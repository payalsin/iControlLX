Contents {#contents .TOCHeading}
========

[Introduction 1](#introduction)

[Pre-requisite 1](#pre-requisite)

[Topology 2](#topology)

[Directory structure 3](#directory-structure)

[Sample APIC logical device configuration
4](#sample-apic-logical-device-configuration)

[Deployment Models 5](#deployment-models)

[Standalone Physical BIG-IP 5](#standalone-physical-big-ip)

[Variable file 5](#variable-file)

[Playbook 7](#playbook)

[HA Physical BIG-IP 10](#ha-physical-big-ip)

[Variable file 10](#variable-file-1)

[Playbook 10](#playbook-1)

[SA vCMP BIG-IP 12](#sa-vcmp-big-ip)

[Variable file 12](#variable-file-2)

[Playbook 12](#playbook-2)

[HA vCMP BIG-IP 14](#ha-vcmp-big-ip)

[Variable file 15](#variable-file-3)

[Playbook 15](#playbook-3)

[SA Virtual Edition BIG-IP 18](#sa-virtual-edition-big-ip)

[Variable file 18](#variable-file-4)

[Playbook 18](#playbook-4)

[HA Virtual Edition BIG-IP 19](#ha-virtual-edition-big-ip)

[Variable file 20](#variable-file-5)

[Playbook 20](#playbook-5)

Introduction
============

Use Ansible to configure BIG-IP to correspond to the UnManaged mode of
APIC deployment. Goal is to perform L2-L3 stitch between the APIC and
BIG-IP

Pre-requisite
=============

-   BIG-IP(s)

    -   Has a MGMT IP assigned to it

    -   Licensed

-   APIC

    -   Configuration is in place including L4-L7 constructs required to
        configure BIG-IP in unmanaged mode (logical device cluster,
        service graph template, contract etc.)

**Note:**

-   Physical cabling to the APIC and between the BIG-IP(s) (if setting
    up HA) is completed

-   The APIC configuration DOES NOT need to be present for the ansible
    playbooks below to work

-   The playbooks will NOT configure the APIC, only the BIG-IP

Topology
========

![](media/image1.png){width="6.5in" height="3.2930555555555556in"}

Physical BIG-IP(s) being used in this example:

-   192.168.73.91 -- Interface 2.2 of the BIG-IP connected to
    Node2/eth1-34 on the APIC

-   192.168.73.92 - Interface 2.2 of the BIG-IP connected to
    Node3/eth1-34 on the APIC

-   Interface 1/1.8 on each vCMP host are connected to each other for HA
    pairing

vCMP capable BIG-IP(s) being used in this example:

-   Host - 192.168.73.80 -- Interface 1/1.3 of the BIG-IP connected to
    Node2/eth1-39 on the APIC

    -   Guest -- 192.168.73.82

-   Host - 192.168.73.86 -- Interface 1/1.3 of the BIG-IP connected to
    Node3/eth1-39 on the APIC

    -   Guest -- 192.168.73.88

-   Interface 1/1.8 on each vCMP host are connected to each other for HA
    pairing

Virtual Edition BIG-IP(s) being used in this example:

-   192.168.73.180 -- Esxi host connected to Node2/eth1/10

-   192.168.73.181 -- Esxi host connected to Node2/eth1/10

-   Network adaptor 1 used for management

-   Network adaptor 2 and 3 used for client and server traffic

-   Network adaptor 4 on each host used for HA pairing

On APIC:

-   Tenant being used -- UM\_F5\_Tenant

-   Logical device cluster for Physical BIG-IPs -- BIGIP\_PHY

-   Logical device cluster for vCMP capable BIG-IPs -- BIGIP\_vCMP

-   Logical device cluster for VE of BIG-IPs -- BIGIP\_VE

Directory structure
===================

![](media/image2.png){width="4.145472440944882in"
height="4.896174540682415in"}

### Sample APIC logical device configuration

#### Logical device configuration for Physical BIG-IP

![](media/image3.png){width="6.5in" height="2.327777777777778in"}

#### Logical device configuration for vCMP enabled BIG-IP

![](media/image4.png){width="6.5in" height="2.74375in"}

#### Logical device configuration for VE of BIG-IP

#### ![](media/image5.png){width="6.5in" height="2.7125in"}

Deployment Models
=================

Standalone Physical BIG-IP
--------------------------

![](media/image6.png){width="6.5in" height="1.4076388888888889in"}

The variable file will contain VLAN tags along with other information.
The VLAN tags should match the VLAN tags configured on APIC in the
logical device cluster. The ansible playbook will only configure the
BIG-IP.

### Variable file

This file will contain all the information needed to configure the
BIG-IP. This variable file is designed to configure the following on the
BIG-IP

-   Onboarding : NTP, DNS, Hostname, SSH settings, Module provisioning

-   Networking: 2 VLAN's, 2 Self-IP's, SNAT

    -   This represents a 2 ARM mode BIG-IP connection to the APIC

        -   Same interface on the BIG-IP will be used for client and
            server traffic

        -   Separate VLAN for client and server traffic is tagged on the
            BIG-IP interface

    -   SNAT is set to none (Assumption: Backend servers have the BIG-IP
        as their default gateway)

-   HTTP service: Pool members, Pool, Virtual Server

+-----------------------------------+-----------------------------------+
| onboarding: \"yes\"               | Do you want to onboard the BIG-IP |
|                                   | - Options: yes/no                 |
+===================================+===================================+
| banner\_text: \"\--Standalone     | SSH banner text                   |
| BIG-IP UnManaged \-\--\"          |                                   |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| hostname: \'bigip.local\'         | Hostname of the BIG-IP (Part of   |
|                                   | onboarding)                       |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| ntp\_servers:                     | NTP servers to be configured      |
|                                   | (Part of onboarding)              |
+-----------------------------------+-----------------------------------+
| \- \'172.27.1.1\'                 |                                   |
+-----------------------------------+-----------------------------------+
| \- \'172.27.1.2\'                 |                                   |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| dns\_servers:                     | DNS servers to be configured      |
|                                   | (Part of onboarding)              |
+-----------------------------------+-----------------------------------+
| \- \'8.8.8.8\'                    |                                   |
+-----------------------------------+-----------------------------------+
| \- \'4.4.4.4\'                    |                                   |
+-----------------------------------+-----------------------------------+
| ip\_version: 4                    |                                   |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| module\_provisioning:             | Modules to be provisioned on      |
|                                   | BIG-IP (Part of onboarding)       |
+-----------------------------------+-----------------------------------+
| \- name: \'ltm\'                  |                                   |
+-----------------------------------+-----------------------------------+
| level: \'nominal\'                |                                   |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| tenant\_name\_aci:                | APIC tenant name                  |
| \"UM\_F5\_Tenant\"                |                                   |
+-----------------------------------+-----------------------------------+
| ldev\_name\_aci: \"BIGIP\_PHY\"   | APIC logical device cluster name  |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| bigip\_ip: 10.192.73.91           | BIG-IP credentials                |
+-----------------------------------+-----------------------------------+
| bigip\_username: \"admin\"        |                                   |
+-----------------------------------+-----------------------------------+
| bigip\_password: \"admin\"        |                                   |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| vlan\_information:                | VLAN to be added to BIG-IP, these |
|                                   | VLAN's match what is present in   |
| \- name: \"External\_VLAN\"       | the logical device cluster        |
|                                   | BIGIP\_PHY                        |
| id: \"1195\"                      |                                   |
|                                   |                                   |
| interface: \"2.2\"                |                                   |
|                                   |                                   |
| \- name: \"Internal\_VLAN\"       |                                   |
|                                   |                                   |
| id: \"1695\"                      |                                   |
|                                   |                                   |
| interface: \"2.2\"                |                                   |
+-----------------------------------+-----------------------------------+
| static\_route:                    | Add a static route                |
|                                   |                                   |
| \- name: \"default\"              |                                   |
|                                   |                                   |
| gw\_address: \"10.168.56.1\"      |                                   |
|                                   |                                   |
| destination: \"0.0.0.0\"          |                                   |
|                                   |                                   |
| netmask: \"0.0.0.0\"              |                                   |
+-----------------------------------+-----------------------------------+
| bigip\_selfip\_information:       | Self-IP to be added to BIG-IP,    |
|                                   | tag the appropriate VLAN to the   |
| \- name: \'External-SelfIP\'      | respective Self-IP                |
|                                   |                                   |
| address: \'10.168.68.10\'         |                                   |
|                                   |                                   |
| netmask: \'255.255.255.0\'        |                                   |
|                                   |                                   |
| vlan:                             |                                   |
| \"{{vlan\_information\[0\]\[\'nam |                                   |
| e\'\]}}\"                         |                                   |
|                                   |                                   |
| \- name: \'Internal-SelfIP\'      |                                   |
|                                   |                                   |
| address: \'192.168.68.10\'        |                                   |
|                                   |                                   |
| netmask: \'255.255.255.0\'        |                                   |
|                                   |                                   |
| vlan:                             |                                   |
| \"{{vlan\_information\[1\]\[\'nam |                                   |
| e\'\]}}\"                         |                                   |
+-----------------------------------+-----------------------------------+
| service: \"yes\"                  | Do you want to configure HTTP     |
|                                   | service on the BIG-IP -Options:   |
|                                   | yes/no                            |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| vip\_name: \"http\_vs\"           | VIP information (Part of          |
|                                   | configuring HTTP service)         |
+-----------------------------------+-----------------------------------+
| vip\_port: \"80\"                 |                                   |
+-----------------------------------+-----------------------------------+
| vip\_ip: \"10.168.68.105\"        |                                   |
+-----------------------------------+-----------------------------------+
| snat: \"None\"                    | Options: 'None/Automap/snat-pool  |
|                                   | name'                             |
+-----------------------------------+-----------------------------------+
| pool\_name: \"web-pool\"          | Pool Information (Part of         |
|                                   | configuring HTTP service)         |
+-----------------------------------+-----------------------------------+
| pool\_members:                    |                                   |
+-----------------------------------+-----------------------------------+
| \- port: \"80\"                   |                                   |
+-----------------------------------+-----------------------------------+
| host: \"192.168.68.140\"          |                                   |
+-----------------------------------+-----------------------------------+
| \- port: \"80\"                   |                                   |
+-----------------------------------+-----------------------------------+
| host: \"192.168.68.141\"          |                                   |
+-----------------------------------+-----------------------------------+

### 

If a different scenario is needed to be configured, for example BIG-IP
in one arm mode, then the variable file will need to be modified
accordingly. The onboarding and http service sections will remain the
same.

-   VLAN and Self-IP -- only 1 entry will be needed

-   SNAT: Automap can be used

-   Example of the changes in the variable file

+--------------------------------------------------+
| vlan\_information:                               |
+==================================================+
| \- name: \"External\_VLAN\"                      |
+--------------------------------------------------+
| id: \"1195\"                                     |
+--------------------------------------------------+
| interface: \"2.2"                                |
+--------------------------------------------------+
|                                                  |
+--------------------------------------------------+
| bigip\_selfip\_information:                      |
+--------------------------------------------------+
| \- name: \'External-SelfIP\'                     |
+--------------------------------------------------+
| address: \'10.168.68.10\'                        |
+--------------------------------------------------+
| netmask: \'255.255.255.0\'                       |
+--------------------------------------------------+
| vlan: \"{{vlan\_information\[0\]\[\'name\'\]}}\" |
|                                                  |
| snat: \"Automap\"                                |
+--------------------------------------------------+

### Playbook

The main.yaml playbook will be executed. Sequence of events

-   If onboarding is set to 'yes' then the onboarding.yaml playbook will
    be executed

-   Network constructs will be configured on the BIG-IP

    -   The name of the VLAN and SELF-IP will tie it to an APIC tenant

-   If service is set to 'yes' then the http\_service.yaml playbook will
    be executed

    -   The name of the virtual server will tie it to an APIC tenant and
        LDEV

**Command to execute playbook**

-   ansible-playbook main.yaml

**Main.yaml**

+-----------------------------------+-----------------------------------+
| \- name: SA Physical Unmanaged    |                                   |
| Mode BIG-IP setup                 |                                   |
+===================================+===================================+
| hosts: localhost                  |                                   |
+-----------------------------------+-----------------------------------+
| connection: local                 |                                   |
+-----------------------------------+-----------------------------------+
| gather\_facts: false              |                                   |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| vars\_files:                      | Include the variable file above   |
+-----------------------------------+-----------------------------------+
| \- variable.yaml                  |                                   |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| tasks:                            |                                   |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| \- include\_tasks:                | Onboarding playbook will be       |
| ../common/onboarding.yaml         | executed                          |
+-----------------------------------+-----------------------------------+
| when: \'\"yes\" in onboarding \'  |                                   |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| \- name: Add VLAN(s)              | VLAN(s) will be added             |
+-----------------------------------+-----------------------------------+
| bigip\_vlan:                      |                                   |
+-----------------------------------+-----------------------------------+
| server: \"{{bigip\_ip}}\"         |                                   |
+-----------------------------------+-----------------------------------+
| user: \"{{ bigip\_username }}\"   |                                   |
+-----------------------------------+-----------------------------------+
| password: \"{{ bigip\_password    |                                   |
| }}\"                              |                                   |
+-----------------------------------+-----------------------------------+
| name:                             | Name will tie it to a APIC tenant |
| \"{{tenant\_name\_aci}}\_{{item.n |                                   |
| ame}}\"                           |                                   |
+-----------------------------------+-----------------------------------+
| tag: \"{{item.id}}\"              |                                   |
+-----------------------------------+-----------------------------------+
| tagged\_interfaces:               | Interface will be tagged          |
+-----------------------------------+-----------------------------------+
| \- \"{{item.interface}}\"         |                                   |
+-----------------------------------+-----------------------------------+
| validate\_certs: \"no\"           |                                   |
+-----------------------------------+-----------------------------------+
| with\_items:                      |                                   |
| \"{{vlan\_information}}\"         |                                   |
+-----------------------------------+-----------------------------------+
|                                   |                                   |
+-----------------------------------+-----------------------------------+
| \- name: Add SELF-IP(s)           | Self-IP will be added             |
+-----------------------------------+-----------------------------------+
| bigip\_selfip:                    |                                   |
+-----------------------------------+-----------------------------------+
| server: \"{{bigip\_ip}}\"         |                                   |
+-----------------------------------+-----------------------------------+
| user: \"{{ bigip\_username }}\"   |                                   |
+-----------------------------------+-----------------------------------+
| password: \"{{ bigip\_password    |                                   |
| }}\"                              |                                   |
+-----------------------------------+-----------------------------------+
| name:                             | Name will tie it to a APIC tenant |
| \"{{tenant\_name\_aci}}\_{{item.n |                                   |
| ame}}\"                           |                                   |
+-----------------------------------+-----------------------------------+
| address: \"{{item.address}}\"     |                                   |
+-----------------------------------+-----------------------------------+
| netmask: \"{{item.netmask}}\"     |                                   |
+-----------------------------------+-----------------------------------+
| vlan:                             |                                   |
| \"{{tenant\_name\_aci}}\_{{item.v |                                   |
| lan}}\"                           |                                   |
+-----------------------------------+-----------------------------------+
| validate\_certs: \"no\"           |                                   |
+-----------------------------------+-----------------------------------+
| with\_items: \"{{                 |                                   |
| bigip\_selfip\_information }}\"   |                                   |
+-----------------------------------+-----------------------------------+
| \- name: Add route(s)             |                                   |
|                                   |                                   |
| bigip\_static\_route:             |                                   |
|                                   |                                   |
| server: \"{{bigip\_ip}}\"         |                                   |
|                                   |                                   |
| user: \"{{ bigip\_username }}\"   |                                   |
|                                   |                                   |
| password: \"{{ bigip\_password    |                                   |
| }}\"                              |                                   |
|                                   |                                   |
| name: \"{{item.name}}\"           |                                   |
|                                   |                                   |
| gateway\_address:                 |                                   |
| \"{{item.gw\_address}}\"          |                                   |
|                                   |                                   |
| netmask: \"{{item.netmask}}\"     |                                   |
|                                   |                                   |
| destination:                      |                                   |
| \"{{item.destination}}\"          |                                   |
|                                   |                                   |
| validate\_certs: \"no\"           |                                   |
|                                   |                                   |
| with\_items:                      |                                   |
| \"{{static\_route}}\"             |                                   |
|                                   |                                   |
| delegate\_to: localhost           |                                   |
+-----------------------------------+-----------------------------------+
| \- include\_tasks:                | Service (VIP/Pool/Members)        |
| ../common/http\_service.yaml      | playbook will be executed         |
+-----------------------------------+-----------------------------------+
| when: \'\"yes\" in service \'     |                                   |
+-----------------------------------+-----------------------------------+

After running the playbook login to the BIG-IP and check all the objects
are configured

![](media/image7.png){width="6.5in" height="4.2444444444444445in"}

To perform a cleanup of the BIG-IP configuration, run the following
playbook:

-   ansible-playbook cleanup.yaml

    This will remove all the objects configured by the above playbook
    (VS/pools/nodes/Self-IPs/VLANS)

HA Physical BIG-IP
------------------

![](media/image8.png){width="6.5in" height="2.3979166666666667in"}

The playbook along with configuration as done on the standalone physical
setup will also configure

-   HA setup between the two BIG-IP's

-   Onboarding tasks on both BIG-IP's

-   Floating-IP(s) setup on the BIG-IP

### Variable file

Variable file will have additional information needed to setup the
BIG-IP HA pair

\<\<To view all the files for this scenario, refer to link \<\<\>\> \>\>

### Playbook

The main.yaml playbook will be executed. Sequence of events

-   If onboarding is set to 'yes' then the onboarding.yaml playbook will
    be executed on both BIG-IPs

-   HA pairing will be configured

-   Network constructs will be configured on the both the BIG-IPs

    -   The name of the VLAN and SELF-IP will tie it to an APIC tenant

-   If service is set to 'yes' then the http\_service.yaml playbook will
    be executed on one BIG-IP (configuration will be synced
    automatically between the pair of BIG-IPs)

    -   The name of the virtual server will tie it to an APIC tenant and
        LDEV

After running the playbook login to both the BIG-IP and that check all
the objects are configured and HA pairing has been done.

![](media/image9.png){width="5.167113954505687in"
height="3.850333552055993in"}

![](media/image10.png){width="5.158470034995625in"
height="3.6503444881889764in"}

To perform a cleanup of the BIG-IP configuration, run the following
playbook:

-   ansible-playbook cleanup.yaml

    This will remove all the objects configured by the above playbook
    (VS/pools/nodes/Self-IPs/VLANS). It will also remove all the objects
    that setup HA (HA pairing will be destroyed)

SA vCMP BIG-IP
--------------

![](media/image11.png){width="6.5in" height="2.745138888888889in"}

The variable file will contain VLAN tags along with other information.
The VLAN tags should match the VLAN tags configured on APIC in the
logical device cluster. The ansible playbook will only configure the
BIG-IP.

### Variable file

This file will contain all the information needed to configure the
BIG-IP. This variable file is designed to configure the following on the
BIG-IP

-   Onboarding the vCMP guest : NTP, DNS, Hostname, SSH settings, Module
    provisioning

-   VLAN's, added to the vCMP host

-   VLAN's assigned from the vCMP host to the vCMP guest

-   2 Self-IP's, SNAT on the vCMP guest

    -   This represents a 2 ARM mode BIG-IP connection to the APIC

        -   VLAN is tagged on a BIG-IP interface

    -   SNAT is set to none (Assumption: Backend servers have the BIG-IP
        as their default gateway)

-   HTTP service: Pool members, Pool, Virtual Server on the vCMP guest

\<\<To view all the files for this scenario, refer to link \<\<\>\> \>\>

### Playbook

The main.yaml playbook will be executed. Sequence of events

-   If onboarding is set to 'yes' then the tasks in the onboarding.yaml
    playbook will be executed on the vCMP guest

-   Network constructs will be configured on the BIG-IP

    -   VLAN will be configured on the vCMP host and then assigned to
        the vCMP guest

    -   SELF-IP will tie it to an APIC tenant

-   If service is set to 'yes' then the http\_service.yaml playbook will
    be executed

    -   The name of the virtual server will tie it to an APIC tenant and
        LDEV

**Command to execute playbook**

-   ansible-playbook main.yaml

After running the playbook login to both the vCMP host and guest and
check all the objects are configured

![Machine generated alternative text: vCMP » Guest List » vCMP82
Properties Basic \'roperties: Name Host Name On Slots Per Slot Memory
use Per Slot Disk use Cores Per Slot Number of Slots Management Network
Cluster IP Address Initial Image Initial Hotfix VLAN List Software
Status vCMP82 Resources Provisioned vCMP82. localdonu 3.5 GB 8.2 GB
Bridged IP Address Network Mask: 10192.7382 255 255255.0 Management
Route: 10\<92.731 \'Common Selected Tenant External VLAN Tenant Internal
VLAN HA Failure 255.2552550 Available \'Common APIC 00B HA VLAN HA VLAN
UM TenantlC External VLAN UM TenantlC Internal VLAN
](media/image12.png){width="5.510076552930884in"
height="4.808926071741032in"}

![](media/image13.png){width="4.7079232283464565in"
height="3.388182414698163in"}

To perform a cleanup of the BIG-IP configuration, run the following
playbook:

-   ansible-playbook cleanup.yaml

    This will remove all the objects configured by the above playbook on
    the vCMP guest (VS/pools/nodes/Self-IPs/VLANS). It will also remove
    objects configured on the vCMP host

HA vCMP BIG-IP
--------------

![](media/image14.png){width="6.5in" height="2.7215277777777778in"}

The variable file will contain VLAN tags along with other information.
The VLAN tags should match the VLAN tags configured on APIC in the
logical device cluster. The ansible playbook will only configure the
BIG-IP.

### Variable file

This file will contain all the information needed to configure the
BIG-IP. This variable file is designed to configure the following on the
BIG-IP

-   Onboarding the vCMP guest : NTP, DNS, Hostname, SSH settings, Module
    provisioning

-   VLAN's, added to the vCMP host

-   VLAN's assigned from the vCMP host to the vCMP guest

-   2 Self-IP's, SNAT on the vCMP guest

    -   This represents a 2 ARM mode BIG-IP connection to the APIC

        -   VLAN is tagged on a BIG-IP interface

    -   SNAT is set to none (Assumption: Backend servers have the BIG-IP
        as their default gateway)

-   HTTP service: Pool members, Pool, Virtual Server on the vCMP guest

\<\<To view all the files for this scenario, refer to link \<\<\>\> \>\>

### Playbook

The main.yaml playbook will be executed. Sequence of events

-   If onboarding is set to 'yes' then the tasks in the onboarding.yaml
    playbook will be executed on the vCMP guest

-   HA pairing between the vCMP guests will be configured

-   Network constructs will be configured on the BIG-IP

    -   VLAN will be configured on the vCMP host and then assigned to
        the vCMP guest

    -   SELF-IP will tie it to an APIC tenant

-   If service is set to 'yes' then the http\_service.yaml playbook will
    be executed

    -   The name of the virtual server will tie it to an APIC tenant and
        LDEV

**Command to execute playbook**

-   ansible-playbook main.yaml

After running the playbook login to both the vCMP hosts and guests and
check all the objects are configured

![Machine generated alternative text: Hostname: IP Address Main bigipl
10192.7386 Cluster Enabled Slot 1: Active Standalone Help Date: Tiffie:
Jan 24, 2018 211 PM (PST) User: admin Role: Administrator About vCMP »
Guest List » vCMP88 ICO Statistics Device Management vCMP Guest List
Guest Status Guest Traffic Profile Virtual Disk List Template List
Statistics Network System Properties Software Status vCMP88 Resources
Provisioned Properties: Name Host Name On Slots Basic Per Slot Memory
use Per Slot Disk use Cores Per Slot Number of Slots Management Network
Cluster IP Address Initial Image Initial Hotfix VLAN List vCMP88.
localdonu 3.5 GB 10.5 GB Bridged IP Address Network Mask: 10192.73 88
255255255.0 Management Route: 10\<92.731 Selected \'Common HA VLAN UM F5
Tenant UM F5 Tenant External VLAN Internal VLAN HA Failure 255.2552550
Available \'Common APIC OOB HA VCAN apic HA 11 CMP Unmanaged HA vCMP OOB
HA ](media/image15.png){width="3.5484405074365704in"
height="2.7818383639545057in"}![Machine generated alternative text:
Hostname: b@pvCMPha1 local IP Address: 10192.7382 Date: Time: About Jan
24, 2018 2:11 PM (PST) User: admin Role Administrator Main Cluster
Enabled Slot 1: Standby In Sync Help Local Traffic » Network Map Network
Map Statistics iApps Wizards 63 DNS Local Traffic Network Map Virtual
Servers Policies Profiles tatus Any Status Type Local Traffic Network
Map 0 UM\_F5\_Tenant\_BlGlP\_vCMP\_http\_vs O UM\_F5\_Tenant\_web-pool 0
192.168.56.140:80 0 192.168.56.141:80
](media/image16.png){width="3.544179790026247in"
height="2.8744083552055995in"}![Machine generated alternative text:
Hostname: IP Address Main bigipl 10192.7380 Cluster Enabled Slot 1:
Active Standalone Help Date: Tiffie: Jan 24, 2018 211 PM (PST) User:
admin Role: Administrator About vCMP » Guest List » vCMP82 Properties
Software Status vCMP82 Resources Provisioned Statistics Device
Management vCMP Guest List Guest Status Guest Traffic Profile Virtual
Disk List Template List Statistics Network System Properties: Name Host
Name On Slots Basic Per Slot Memory use Per Slot Disk use Cores Per Slot
Number of Slots Management Network Cluster IP Address Initial Image
Initial Hotfix VLAN List vCMP82. localdonu 3.5 GB 8.2 GB Bridged IP
Address Network Mask: 10192.7382 255255255.0 Management Route:
10\<92.731 Selected \'Common HA VLAN UM F5 Tenant UM F5 Tenant External
VLAN Internal VLAN HA Failure 255.2552550 Available \'Common APIC OOB HA
VLAN UM TenantlC External VLAN UM TenantlC Internal VLAN apic-HA 11
](media/image17.png){width="4.128981846019248in"
height="3.048941382327209in"}![Machine generated alternative text:
Hostnanne: IP Address: 10192.7382 Cluster Enabled Slot 1: Active Date:
Time: About Jan 24, 2018 1 PM (PST) User. admin Role: Administrator Main
Standalone Help Local Traffic » Network Map Network Map 10 Statistics
iApps Wizards DNS Local Traffic Network Map Virtual Servers Policies
tatus Any Status Type Update Map Local Traffic Network Map 0
UM\_F5\_Tenant\_BlGlP\_vCMP\_http\_vs O UM\_F5\_Tenant\_web-pool 0
192.168.56.140:80 0 192.168.56.141:80
](media/image18.png){width="4.1275798337707785in"
height="2.971323272090989in"}

To perform a cleanup of the BIG-IP configuration, run the following
playbook:

-   ansible-playbook cleanup.yaml

    This will remove all the objects configured by the above playbook on
    the vCMP guest (VS/pools/nodes/Self-IPs/VLANS). It will also remove
    objects configured on the vCMP host. HA pairing will also be
    destroyed

SA Virtual Edition BIG-IP
-------------------------

![](media/image19.png){width="6.5in" height="1.5986111111111112in"}

The variable file will contain VLAN tags along with other information.
The VLAN tags should match the VLAN tags assigned by APIC once the
service graph is deployed. The ansible playbook will only configure the
BIG-IP.

![](media/image20.png){width="6.5in" height="1.9944444444444445in"}

### Variable file

This file will contain all the information needed to configure the
BIG-IP. This variable file is designed to configure the following on the
BIG-IP

-   Onboarding the vCMP guest : NTP, DNS, Hostname, SSH settings, Module
    provisioning

-   Networking: VLAN's, Self-IPs

-   HTTP service: Pool members, Pool, Virtual Server

### Playbook

The main.yaml playbook will be executed. Sequence of events

-   If onboarding is set to 'yes' then the tasks in the onboarding.yaml
    playbook will be executed

-   Network constructs will be configured on the BIG-IP (VLAN and
    Self-IP)

    -   The VLAN will be untagged on the respective interface

-   If service is set to 'yes' then the http\_service.yaml playbook will
    be executed

    -   The name of the virtual server will tie it to an APIC tenant and
        LDEV

**Command to execute playbook**

-   ansible-playbook main.yaml

After running the playbook login to the BIG-IP and check all the objects
are configured

![](media/image21.png){width="6.5in" height="4.1097222222222225in"}

To perform a cleanup of the BIG-IP configuration, run the following
playbook:

-   ansible-playbook cleanup.yaml

    This will remove all the objects configured by the above playbook
    (VS/pools/nodes/Self-IPs/VLANS)

HA Virtual Edition BIG-IP
-------------------------

![](media/image23.png){width="6.5in" height="2.536111111111111in"}

The variable file will contain VLAN tags along with other information.
The VLAN tags should match the VLAN tags assigned by APIC once the
service graph is deployed. The ansible playbook will only configure the
BIG-IP.

![](media/image20.png){width="6.5in" height="1.9944444444444445in"}

The playbook along with configuration as done on the standalone VE setup
will also configure

-   HA setup between the two BIG-IP's

-   Onboarding tasks on both BIG-IP's

-   Floating-IP(s) setup on the BIG-IP

### Variable file

Variable file will have additional information needed to setup the
BIG-IP HA pair

\<\<To view all the files for this scenario, refer to link \<\<\>\> \>\>

### Playbook

The main.yaml playbook will be executed. Sequence of events

-   If onboarding is set to 'yes' then the onboarding.yaml playbook will
    be executed on both BIG-IPs

-   HA pairing will be configured

-   Network constructs will be configured on the both the BIG-IPs

    -   The name of the VLAN and SELF-IP will tie it to an APIC tenant

-   If service is set to 'yes' then the http\_service.yaml playbook will
    be executed on one BIG-IP (configuration will be synced
    automatically between the pair of BIG-IPs)

    -   The name of the virtual server will tie it to an APIC tenant and
        LDEV

After running the playbook login to both the BIG-IP and that check all
the objects are configured and HA pairing has been done.

![](media/image24.png){width="5.595833333333333in"
height="3.748611111111111in"}

![Machine generated alternative text: Hostname: IP Address: 10192.73181
ONLINE (ACTIVE) Date: Time: Jan 24, 2018 319 PM (PST) User: Role: Main
In Sync Help About Local Traffic » admin Administrator Network Map 10
Statistics iApps 63 DNS Local Traffic Network Map Virtual Servers
Policies Profiles iRules pools Nodes Monitors tatus Network Map Any
Status Type All Types Local Traffic Network Map 0
UM\_F5\_Tenant\_BlGlP\_VE\_http\_vs\_1 O UM\_F5\_Tenant\_web-pool 0
192.168.56.140:80 0 192.168.56.141:80
](media/image26.png){width="4.538806867891513in"
height="3.502516404199475in"}

To perform a cleanup of the BIG-IP configuration, run the following
playbook:

-   ansible-playbook cleanup.yaml

    This will remove all the objects configured by the above playbook
    (VS/pools/nodes/Self-IPs/VLANS). It will also remove all the objects
    that setup HA (HA pairing will be destroyed)
