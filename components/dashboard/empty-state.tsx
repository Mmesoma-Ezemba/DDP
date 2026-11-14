import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CubeIcon from "@/components/icons/cube"
import UsersIcon from "@/components/icons/users"

interface EmptyStateProps {
  type: "vaults" | "beneficiaries" | "general"
}

export function EmptyState({ type }: EmptyStateProps) {
  if (type === "vaults") {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CubeIcon className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl uppercase mb-2">No Vaults Yet</CardTitle>
          <CardDescription className="text-sm break-words px-2">
            Create your first digital vault to secure your digital legacy
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center px-4 sm:px-6 pb-6">
          <Link href="/vaults" className="inline-block">
            <Button variant="default" size="default">
              Create Your First Vault
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (type === "beneficiaries") {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <UsersIcon className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-xl uppercase mb-2">No Beneficiaries Yet</CardTitle>
          <CardDescription className="text-sm break-words px-2">
            Add beneficiaries to your vaults to ensure your digital assets are passed on
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center px-4 sm:px-6 pb-6">
          <Link href="/beneficiary" className="inline-block">
            <Button variant="default" size="default">
              Add Your First Beneficiary
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="text-center px-4 sm:px-6">
        <CardTitle className="text-xl uppercase mb-2">No Data Available</CardTitle>
        <CardDescription className="text-sm break-words px-2">
          Get started by creating your first vault or adding beneficiaries
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-3 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-center px-4 sm:px-6 pb-6">
        <Link href="/vaults" className="w-full sm:w-auto">
          <Button variant="default" size="default" className="w-full sm:w-auto">
            Create Vault
          </Button>
        </Link>
        <Link href="/beneficiary" className="w-full sm:w-auto">
          <Button variant="outline" size="default" className="w-full sm:w-auto">
            Add Beneficiary
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

