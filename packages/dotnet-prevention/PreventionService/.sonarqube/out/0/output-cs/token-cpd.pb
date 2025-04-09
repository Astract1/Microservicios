è
rC:\Users\Juan Jimenez\Desktop\Microservicios\packages\dotnet-prevention\PreventionService\Utils\ValidationUtils.cs
	namespace 	
PreventionService
 
. 
Utils !
{ 
public 

static 
class 
ValidationUtils '
{ 
public 
static 
bool 
IsValidUserId (
(( )
int) ,
userId- 3
)3 4
{ 	
return 
userId 
> 
$num 
; 
} 	
}		 
}

 ª
dC:\Users\Juan Jimenez\Desktop\Microservicios\packages\dotnet-prevention\PreventionService\Startup.cs
	namespace 	
PreventionService
 
{ 
public 

class 
Startup 
{ 
private		 
readonly		 
IConfiguration		 '
_configuration		( 6
;		6 7
public 
Startup 
( 
IConfiguration %
configuration& 3
)3 4
{ 	
_configuration 
= 
configuration *
;* +
} 	
public 
void 
ConfigureServices %
(% &
IServiceCollection& 8
services9 A
)A B
{ 	
services 
. 
AddControllers #
(# $
)$ %
;% &
var 

riskApiUrl 
= 
_configuration +
[+ ,
$str, A
]A B
;B C
if 
( 
string 
. 
IsNullOrWhiteSpace )
() *

riskApiUrl* 4
)4 5
)5 6
{ 
throw 
new %
InvalidOperationException 3
(3 4
$str4 y
)y z
;z {
} 
services 
. 
AddHttpClient "
<" #
RiskServiceClient# 4
>4 5
(5 6
client6 <
=>= ?
{ 
client 
. 
BaseAddress "
=# $
new% (
Uri) ,
(, -

riskApiUrl- 7
)7 8
;8 9
} 
) 
; 
services!! 
.!! 
	AddScoped!! 
<!! !
RecommendationService!! 4
>!!4 5
(!!5 6
)!!6 7
;!!7 8
var$$ 
connectionString$$  
=$$! "
_configuration$$# 1
.$$1 2
GetConnectionString$$2 E
($$E F
$str$$F Y
)$$Y Z
;$$Z [
if%% 
(%% 
string%% 
.%% 
IsNullOrWhiteSpace%% )
(%%) *
connectionString%%* :
)%%: ;
)%%; <
{&& 
throw'' 
new'' %
InvalidOperationException'' 3
(''3 4
$str''4 t
)''t u
;''u v
}(( 
services** 
.** 
AddDbContext** !
<**! "
PreventionDbContext**" 5
>**5 6
(**6 7
options**7 >
=>**? A
options++ 
.++ 
	UseSqlite++ !
(++! "
connectionString++" 2
)++2 3
)++3 4
;++4 5
},, 	
public.. 
void.. 
	Configure.. 
(.. 
IApplicationBuilder.. 1
app..2 5
,..5 6
IWebHostEnvironment..7 J
env..K N
)..N O
{// 	
if00 
(00 
env00 
.00 
IsDevelopment00 !
(00! "
)00" #
)00# $
{11 
app22 
.22 %
UseDeveloperExceptionPage22 -
(22- .
)22. /
;22/ 0
}33 
app55 
.55 

UseRouting55 
(55 
)55 
;55 
app77 
.77 
UseEndpoints77 
(77 
	endpoints77 &
=>77' )
{88 
	endpoints99 
.99 
MapControllers99 (
(99( )
)99) *
;99* +
}:: 
):: 
;:: 
};; 	
}<< 
}== 
wC:\Users\Juan Jimenez\Desktop\Microservicios\packages\dotnet-prevention\PreventionService\Services\RiskServiceClient.cs
	namespace 	
PreventionService
 
. 
Services $
{ 
public 

class 
RiskServiceClient "
{		 
private

 
readonly

 

HttpClient

 #
_httpClient

$ /
;

/ 0
public 
RiskServiceClient  
(  !

HttpClient! +

httpClient, 6
)6 7
{ 	
_httpClient 
= 

httpClient $
;$ %
} 	
public 
async 
Task 
<  
RiskEvaluationResult .
>. /"
GetRiskEvaluationAsync0 F
(F G
intG J
userIdK Q
)Q R
{ 	
var 
userData 
= 
new 
{  
userId! '
=( )
userId* 0
}1 2
;2 3
var 
response 
= 
await  
_httpClient! ,
., -
PostAsJsonAsync- <
(< =
$str= Q
,Q R
userDataS [
)[ \
;\ ]
response 
. #
EnsureSuccessStatusCode ,
(, -
)- .
;. /
var 
content 
= 
await 
response  (
.( )
Content) 0
.0 1
ReadAsStringAsync1 B
(B C
)C D
;D E
return 
JsonSerializer !
.! "
Deserialize" -
<- . 
RiskEvaluationResult. B
>B C
(C D
contentD K
)K L
!L M
;M N
} 	
} 
} ô
{C:\Users\Juan Jimenez\Desktop\Microservicios\packages\dotnet-prevention\PreventionService\Services\RecommendationService.cs
	namespace 	
PreventionService
 
. 
Services $
{ 
public 

class !
RecommendationService &
{ 
public 
Recommendation "
GenerateRecommendation 4
(4 5 
RiskEvaluationResult5 I

riskResultJ T
)T U
{ 	
return		 
new		 
Recommendation		 %
{

 
	RiskLevel 
= 

riskResult &
.& '
	RiskLevel' 0
,0 1
Tips 
= 

riskResult !
.! "
Recommendations" 1
,1 2
Title 
= 
$str 8
,8 9
Description 
= 
$str G
} 
; 
} 	
} 
} €
dC:\Users\Juan Jimenez\Desktop\Microservicios\packages\dotnet-prevention\PreventionService\Program.cs
var 
builder 
= 
WebApplication 
. 
CreateBuilder *
(* +
args+ /
)/ 0
;0 1
builder 
. 
Services 
. 
AddControllers 
(  
)  !
;! "
var

 
connectionString

 
=

 
builder

 
.

 
Configuration

 ,
.

, -
GetConnectionString

- @
(

@ A
$str

A T
)

T U
;

U V
builder 
. 
Services 
. 
AddDbContext 
< 
PreventionDbContext 1
>1 2
(2 3
options3 :
=>; =
options 
. 
	UseSqlite 
( 
connectionString &
)& '
)' (
;( )
var 
app 
= 	
builder
 
. 
Build 
( 
) 
; 
using 
( 
var 

scope 
= 
app 
. 
Services 
.  
CreateScope  +
(+ ,
), -
)- .
{ 
var 
	dbContext 
= 
scope 
. 
ServiceProvider )
.) *
GetRequiredService* <
<< =
PreventionDbContext= P
>P Q
(Q R
)R S
;S T
await 	
	dbContext
 
. 
Database 
. 
MigrateAsync )
() *
)* +
;+ ,
} 
app 
. 

UseRouting 
( 
) 
; 
app 
. 
MapControllers 
( 
) 
; 
await 
app 	
.	 

RunAsync
 
( 
) 
; Ü
xC:\Users\Juan Jimenez\Desktop\Microservicios\packages\dotnet-prevention\PreventionService\Models\RiskEvaluationResult.cs
	namespace 	
PreventionService
 
. 
Models "
{ 
public 

class  
RiskEvaluationResult %
{ 
public 
required 
string 
	RiskLevel (
{) *
get+ .
;. /
set0 3
;3 4
}5 6
public 
required 
string 
[ 
]  
Recommendations! 0
{1 2
get3 6
;6 7
set8 ;
;; <
}= >
} 
} ¼	
rC:\Users\Juan Jimenez\Desktop\Microservicios\packages\dotnet-prevention\PreventionService\Models\Recommendation.cs
	namespace 	
PreventionService
 
. 
Models "
{ 
public 

class 
Recommendation 
{ 
public 
int 
Id 
{ 
get 
; 
set  
;  !
}" #
public 
required 
string 
Title $
{% &
get' *
;* +
set, /
;/ 0
}1 2
public 
required 
string 
Description *
{+ ,
get- 0
;0 1
set2 5
;5 6
}7 8
public 
required 
string 
	RiskLevel (
{) *
get+ .
;. /
set0 3
;3 4
}5 6
public		 
required		 
string		 
[		 
]		  
Tips		! %
{		& '
get		( +
;		+ ,
set		- 0
;		0 1
}		2 3
}

 
} Ä
‡C:\Users\Juan Jimenez\Desktop\Microservicios\packages\dotnet-prevention\PreventionService\Migrations\20250409023722_InitialMigration.cs
	namespace 	
PreventionService
 
. 

Migrations &
{ 
public 

partial 
class 
InitialMigration )
:* +
	Migration, 5
{		 
	protected 
override 
void 
Up  "
(" #
MigrationBuilder# 3
migrationBuilder4 D
)D E
{ 	
migrationBuilder 
. 
CreateTable (
(( )
name 
: 
$str #
,# $
columns 
: 
table 
=> !
new" %
{ 
Id 
= 
table 
. 
Column %
<% &
int& )
>) *
(* +
type+ /
:/ 0
$str1 :
,: ;
nullable< D
:D E
falseF K
)K L
. 

Annotation #
(# $
$str$ :
,: ;
true< @
)@ A
,A B
Name 
= 
table  
.  !
Column! '
<' (
string( .
>. /
(/ 0
type0 4
:4 5
$str6 <
,< =
nullable> F
:F G
falseH M
)M N
,N O
Description 
=  !
table" '
.' (
Column( .
<. /
string/ 5
>5 6
(6 7
type7 ;
:; <
$str= C
,C D
nullableE M
:M N
falseO T
)T U
} 
, 
constraints 
: 
table "
=># %
{ 
table 
. 

PrimaryKey $
($ %
$str% 5
,5 6
x7 8
=>9 ;
x< =
.= >
Id> @
)@ A
;A B
} 
) 
; 
} 	
	protected 
override 
void 
Down  $
($ %
MigrationBuilder% 5
migrationBuilder6 F
)F G
{ 	
migrationBuilder 
. 
	DropTable &
(& '
name   
:   
$str   #
)  # $
;  $ %
}!! 	
}"" 
}## È
tC:\Users\Juan Jimenez\Desktop\Microservicios\packages\dotnet-prevention\PreventionService\DTOs\RecommendationsDTO.cs
	namespace 	
PreventionService
 
. 
DTOs  
{ 
public 

class 
RecommendationDto "
{ 
public 
required 
string 
	RiskLevel (
{) *
get+ .
;. /
set0 3
;3 4
}5 6
public 
required 
string 
[ 
]  
Tips! %
{& '
get( +
;+ ,
set- 0
;0 1
}2 3
} 
} Ð
uC:\Users\Juan Jimenez\Desktop\Microservicios\packages\dotnet-prevention\PreventionService\Data\PreventionDbContext.cs
	namespace 	
PreventionService
 
. 
Data  
{ 
public 

class 
PreventionDbContext $
:% &
	DbContext' 0
{ 
public 
PreventionDbContext "
(" #
DbContextOptions# 3
<3 4
PreventionDbContext4 G
>G H
optionsI P
)P Q
:R S
baseT X
(X Y
optionsY `
)` a
{b c
}d e
public

 
DbSet

 
<

 

Prevention

 
>

  
Preventions

! ,
{

- .
get

/ 2
;

2 3
set

4 7
;

7 8
}

9 :
} 
public 

class 

Prevention 
{ 
public 
int 
Id 
{ 
get 
; 
set  
;  !
}" #
public 
required 
string 
Name #
{$ %
get& )
;) *
set+ .
;. /
}0 1
public 
required 
string 
Description *
{+ ,
get- 0
;0 1
set2 5
;5 6
}7 8
} 
} Ü
}C:\Users\Juan Jimenez\Desktop\Microservicios\packages\dotnet-prevention\PreventionService\Controllers\PreventionController.cs
	namespace 	
PreventionService
 
. 
Controllers '
{ 
[ 
ApiController 
] 
[ 
Route 

(
 
$str 
) 
] 
public 

class  
PreventionController %
:& '
ControllerBase( 6
{		 
private

 
readonly

 
RiskServiceClient

 *
_riskServiceClient

+ =
;

= >
private 
readonly !
RecommendationService ."
_recommendationService/ E
;E F
public  
PreventionController #
(# $
RiskServiceClient$ 5
riskServiceClient6 G
,G H!
RecommendationServiceI ^!
recommendationService_ t
)t u
{ 	
_riskServiceClient 
=  
riskServiceClient! 2
;2 3"
_recommendationService "
=# $!
recommendationService% :
;: ;
} 	
[ 	
HttpGet	 
( 
$str +
)+ ,
], -
public 
async 
Task 
< 
IActionResult '
>' (
GetRecommendations) ;
(; <
int< ?
userId@ F
)F G
{ 	
var 

riskResult 
= 
await "
_riskServiceClient# 5
.5 6"
GetRiskEvaluationAsync6 L
(L M
userIdM S
)S T
;T U
var 
recommendation 
=  "
_recommendationService! 7
.7 8"
GenerateRecommendation8 N
(N O

riskResultO Y
)Y Z
;Z [
return 
Ok 
( 
recommendation $
)$ %
;% &
} 	
} 
} û
tC:\Users\Juan Jimenez\Desktop\Microservicios\packages\dotnet-prevention\PreventionService\Config\HttpClientConfig.cs
	namespace 	
PreventionService
 
. 
Config "
{ 
public 

class 
HttpClientConfig !
{ 
public 
required 
string 
BaseUrl &
{' (
get) ,
;, -
set. 1
;1 2
}3 4
} 
} 