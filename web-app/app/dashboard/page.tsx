import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import OnboardingOverlay from "@/components/ui/onboarding-overlay";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import WidgetDisplay from "@/components/WidgetDisplay";
import { checkUser } from "@/lib/actions/User";
import { User } from "@prisma/client";
import { Separator } from "@radix-ui/react-separator";

const Dashboard = async () => {
  const getUser = await checkUser();

  return <div className="h-full w-full">
    {
      getUser?.usernew && <OnboardingOverlay />
    }
    <SidebarProvider>
      <AppSidebar user={getUser?.user as User} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Widgets</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="bg-muted/50 h-full w-full rounded-xl border-dashed grid place-items-center">
            {getUser &&
              <WidgetDisplay user={getUser}></WidgetDisplay>
            }
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  </div>
}
export default Dashboard;
