const QUOTA_DAILY =  120		'�C�Ѱt��
const INTERVAL = 3					'���j�ɶ�
stay = 	5									'���d�ɶ�
regActTime = "1/1/1990"

set xshell = CreateObject("WScript.Shell")
'Ū���̪�ϥΤ��
on error resume next
regActTime= xshell.RegRead("HKCU\SOFTWARE\zqb\usingtime\actionTime")	'�ھ��X�i�H�Y�g
on error goto 0

actTime = Now
actQuota = QUOTA_DAILY
'�Y����Ȫť�, �Τ��O����
if regActTime = "1/1/1990" OR datevalue(regActTime) <> date then		'
	regActTime = month(actTime)& "/" & day(actTime) & "/" & year(actTime) & " " & formatDateTime(actTime,4)
'�h������m
	xshell.RegWrite "HKCU\SOFTWARE\zqb\usingtime\actionTime", regActTime		' �w�]�κA��"REG_SZ"	
'���B�׭��m
	xshell.RegWrite "HKCU\SOFTWARE\zqb\usingtime\minuteQuotaDaily", QUOTA_DAILY, "REG_DWORD"	'�t���|���i�@�֫إ�, �T�ӰѼƳ��n
else
'�_�h���o�̪�ɶ�
	actTime = CDate(regActTime)
	
	on error resume next
	regQuota = xshell.RegRead("HKCU\SOFTWARE\zqb\usingtime\minuteQuotaDaily")	'�ھ��X�i�H�Y�g
	on error goto 0

	if regQuota = "" then 
		xshell.RegWrite "HKCU\SOFTWARE\zqb\usingtime\minuteQuotaDaily", QUOTA_DAILY, "REG_DWORD"	'�t���|���i�@�֫إ�, �T�ӰѼƳ��n
	else
'���o�Ѿl�B��
		actQuota = CInt(regQuota)
	end if
end if
'�ˬd���j�ɶ��O�_����
intervaltmp = DateDiff("n", actTime, Now )
if  intervaltmp <  INTERVAL then
	xshell.Popup "���j�ɶ�" & intervaltmp & "����, ����" & INTERVAL & "����", 10, "�T��", 4096
	'CreateObject("WScript.Shell").run "shutdown /l /f"	'�n�X
	WScript.quit()
end if

xshell.Popup "�i��" & stay & "����, �l�B" & actQuota &"�����C", 10, "�T��", 4096
for min= stay to 1 step -1
'�C�j60��O���@��
	WScript.Sleep 60*1000
	actQuota = actQuota - 1
'�g�J�l�B
	xshell.RegWrite "HKCU\SOFTWARE\zqb\usingtime\minuteQuotaDaily", actQuota, "REG_DWORD"	'�t���|���i�@�֫إ�, �T�ӰѼƳ��n
'�g�J�ɶ�
	actTime = Now
	regActTime = month(actTime)& "/" & day(actTime) & "/" & year(actTime) & " " & formatDateTime(actTime,4)
	xshell.RegWrite "HKCU\SOFTWARE\zqb\usingtime\actionTime", regActTime		' �w�]�κA��"REG_SZ"	
'���찱�d�ɶ�����
next

xshell.Popup "�ɶ���, �N�n�X�C", 10, "�T��", 4096
'CreateObject("WScript.Shell").run "shutdown /l /f"	'�n�X
WScript.quit()